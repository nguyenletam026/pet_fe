import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../Base_Api";
import { 
  Button, Modal, Input, Spin, Alert, Card, List, Image, Typography, Row, Col,
  Space, Divider, Tag 
} from "antd";
import { 
  ShoppingCartOutlined, DollarOutlined, LoadingOutlined,
  QrcodeOutlined, WalletOutlined, CheckCircleOutlined 
} from "@ant-design/icons";
import Header from "./Header";
import { div } from "framer-motion/client";

interface CartItem {
  productId: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
    price: number;
    image: string;
    type: string;
  };
}

interface OrderResponse {
  code: number;
  message: string;
  result: number;
}

interface OrderDetail {
  id: number;
  orderTime: string;
  orderItems: Array<{
    id: number;
    order: string;
    product: {
      id: number;
      name: string;
      price: number;
      image: string;
      type: string;
    };
    quantity: number;
  }>;
  totalPrice: number;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    balance: number;
  };
  status: string;
}

interface UserBalance {
  code: number;
  message: string;
  result: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    balance: number;
  };
}

interface TransactionCheck {
  code: number;
  message: string;
  result: boolean;
}

interface PayOrderResponse {
  code: number;
  message: string;
  result: string;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [paymentModalVisible, setPaymentModalVisible] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [transactionCode, setTransactionCode] = useState<string>("");
  const [checkingPayment, setCheckingPayment] = useState<boolean>(false);
  const [orderSuccessful, setOrderSuccessful] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null); // State to store orderId from createOrder

  const { Title, Text } = Typography;

  // Preset amounts for quick selection
  const presetAmounts = [100000, 200000, 500000];

  const token = localStorage.getItem("token");
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });

  useEffect(() => {
    loadCartItems();
  }, []);

  const generateRandomString = (length: number = 15) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result.toUpperCase();
  };

  const loadCartItems = async () => {
    setLoading(true);
    try {
      const cartItemsString = localStorage.getItem("cart");
      if (cartItemsString) {
        const parsedItems: CartItem[] = JSON.parse(cartItemsString);
        const itemsWithDetails = await Promise.all(
          parsedItems.map(async (item) => {
            try {
              const response = await axiosInstance.get(`/products/${item.productId}`);
              return { ...item, product: response.data.result };
            } catch (err) {
              console.error(`Error fetching product ${item.productId}:`, err);
              return item;
            }
          })
        );
        setCartItems(itemsWithDetails);
      }
    } catch (error) {
      console.error("Error loading cart items:", error);
      setError("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    setLoading(true);
    try {
      const orderPayload = {
        orderTime: new Date().toISOString(),
        orderItems: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const response = await axiosInstance.post<OrderResponse>("/orders", orderPayload);
      const newOrderId = response.data.result;
      console.log("Order ID from createOrder:", newOrderId); // Log order ID for debugging
      setOrderId(newOrderId); // Store orderId in state
      await getOrderDetails(newOrderId);
    } catch (error) {
      console.error("Error creating order:", error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || "Failed to create order");
      } else {
        setError("Failed to create order due to an unexpected error");
      }
    } finally {
      setLoading(false);
    }
  };

  const getOrderDetails = async (orderId: number) => {
    try {
      const response = await axiosInstance.get<{ code: number; message: string; result: OrderDetail }>(
        `/orders/${orderId}`
      );
      console.log("Order Details Response:", response.data);
  
      if (response.data.code === 1000 && response.data.result) {
        const details = response.data.result;
        
        // Store the order details first
        setOrderDetail(details);
        setOrderId(details.id);
        
        // Instead of relying on state updates, pass the data directly to getUserBalance
        await getUserBalance(details, details.id);
      } else {
        setError("Failed to get valid order details");
      }
    } catch (error) {
      console.error("Error getting order details:", error);
      setError("Failed to get order details");
    }
  };
  
  const getUserBalance = async (orderDetailParam?: OrderDetail | null, orderIdParam?: number | null) => {
    try {
      const response = await axiosInstance.get<UserBalance>("/users/myInfo");
      
      if (response.data.code === 1000) {
        // Parse balance as number explicitly
        const balance = parseFloat(response.data.result.balance as any);
        setUserBalance(balance);
        
        // Use passed parameters first, then fall back to state if they're not provided
        const currentOrderDetail = orderDetailParam || orderDetail;
        const currentOrderId = orderIdParam || orderId;
        
        if (!currentOrderDetail || !currentOrderId) {
          console.error("Missing orderDetail or orderId in getUserBalance");
          setError("Order information is missing. Please try again.");
          return;
        }
        
        if (currentOrderDetail.totalPrice > balance) {
          setPaymentModalVisible(true);
        } else {
          await payOrder(currentOrderId);
        }
      }
    } catch (error) {
      console.error("Error getting user balance:", error);
      setError("Failed to get user balance");
    }
  };

  const handlePaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentAmount(e.target.value);
    // Clear any previously generated QR code when the amount changes
    setQrCode("");
    setTransactionCode("");
  };

  const selectPresetAmount = (amount: number) => {
    setPaymentAmount(amount.toString());
    // Generate QR code directly when preset amount is selected
    generateQrCodeWithAmount(amount.toString());
  };

  const generateQrCodeWithAmount = (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount to top up");
      return;
    }
    
    const des = generateRandomString();
    setTransactionCode(des);

    const qrUrl = `https://qr.sepay.vn/img?acc=04128789601&bank=TPBANK&amount=${amount}&des=${des}&template=TEMPLATE&download=DOWNLOAD`;
    setQrCode(qrUrl);
  };

  const generateQrCode = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError("Please enter a valid amount to top up");
      return;
    }
    generateQrCodeWithAmount(paymentAmount);
  };

  const checkTransaction = async () => {
    if (!transactionCode || !orderId) {
      setError("Transaction code or order ID is missing");
      return;
    }

    setCheckingPayment(true);
    const startTime = Date.now();
    const timeoutDuration = 5 * 60 * 1000; // 5 minutes

    const checkInterval = setInterval(async () => {
      try {
        const response = await axiosInstance.get<TransactionCheck>("/transactions/check_wallet", {
          params: {
            amount: paymentAmount,
            des: transactionCode,
          },
        });

        if (response.data.result === true) {
          clearInterval(checkInterval);
          setCheckingPayment(false);
          setPaymentModalVisible(false);
          await payOrder(orderId); // Use orderId from state
        } else if (Date.now() - startTime > timeoutDuration) {
          clearInterval(checkInterval);
          setCheckingPayment(false);
          setError("Payment timeout. Please try again.");
        }
      } catch (error) {
        console.error("Error checking transaction:", error);
        setError("Failed to check payment status");
      }
    }, 3000); // Check every 3 seconds
  };

  const payOrder = async (orderId: number) => {
    if (!orderId) {
      setError("Order ID is null, cannot process payment");
      return;
    }
    try {
      console.log("Order ID from payOrder:", orderId); // Log order ID for debugging
      const response = await axiosInstance.post<PayOrderResponse>(`/orders/payOrder/${orderId}`);
      console.log("Pay Order Response:", response); // Log response for debugging

      if (response.data.result === "Order paid successfully!") {
        setOrderSuccessful(true);
        localStorage.removeItem("cart");
        setCartItems([]);
      } else {
        setError(response.data.message || "Payment failed");
      }
    } catch (error) {
      console.error("Error paying for order:", error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || "Failed to complete payment");
      } else {
        setError("Failed to complete payment due to an unexpected error");
      }
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.product?.price || 0;
      return total + itemPrice * item.quantity;
    }, 0);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
      </div>
    );
  }

  if (orderSuccessful) {
    return (
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <Header />
        <Card className="success-card" style={{ 
          borderRadius: "8px", 
          boxShadow: "0 8px 16px rgba(0,0,0,0.08)" 
        }}>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckCircleOutlined style={{ fontSize: "64px", color: "#52c41a" }} />
            <Title level={2} style={{ margin: "20px 0", color: "#52c41a" }}>
              Đặt hàng thành công!
            </Title>
            <Text style={{ fontSize: "16px", display: "block", marginBottom: "30px" }}>
              Đơn hàng của bạn đã được thanh toán và đang được xử lý.
            </Text>
            <Button 
              type="primary" 
              size="large"
              onClick={() => (window.location.href = "/home")}
              style={{ padding: "0 40px", height: "48px", fontSize: "16px" }}
            >
              Tiếp tục Mua Sắm
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
        <div>
        <Header />
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: "20px" }} />
        <div style={{ textAlign: "center" }}>
          <Button onClick={() => setError(null)} size="large">Try Again</Button>
        </div>
      </div>
        </div>
    );
  }

  return (
    <div>
        <Header />
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      
      <Card style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.09)" }}>
        <Title level={2} style={{ marginBottom: "24px", display: "flex", alignItems: "center", color: "#1890ff" }}>
          <ShoppingCartOutlined style={{ marginRight: "12px" }} /> Giỏ Hàng
        </Title>

        {cartItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <ShoppingCartOutlined style={{ fontSize: "64px", color: "#ccc" }} />
            <p style={{ marginTop: "20px", fontSize: "16px" }}>Giỏ hàng của bạn đang trống</p>
            <Button 
              type="primary" 
              href="/products?type=FOOD" 
              size="large"
              style={{ marginTop: "20px", padding: "0 30px", height: "40px" }}
            >
              Tiếp Tục Mua Sắm
            </Button>
          </div>
        ) : (
          <>
            <List
              itemLayout="horizontal"
              dataSource={cartItems}
              renderItem={(item) => (
                <List.Item style={{ padding: "16px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <List.Item.Meta
                    avatar={
                      <Image 
                        width={100} 
                        height={100}
                        style={{ objectFit: "cover", borderRadius: "4px" }}
                        src={item.product?.image || "https://placeholder.com/80"} 
                      />
                    }
                    title={
                      <Text style={{ fontSize: "16px", fontWeight: "500" }}>
                        {item.product?.name || `Product #${item.productId}`}
                      </Text>
                    }
                    description={
                      <Tag color="blue">
                        {item.product?.price?.toLocaleString() || 0} VNĐ
                      </Tag>
                    }
                  />
                  <div>
                    <Text style={{ marginBottom: "8px", display: "block" }}>
                      Số Lượng: <Text strong>{item.quantity}</Text>
                    </Text>
                    <Text strong style={{ fontSize: "16px", color: "#ff4d4f" }}>
                      {((item.product?.price || 0) * item.quantity).toLocaleString()} VNĐ
                    </Text>
                  </div>
                </List.Item>
              )}
            />

            <Divider />

            <Row justify="end" style={{ marginTop: "20px" }}>
              <Col>
                <Title level={3} style={{ color: "#ff4d4f", marginBottom: "16px" }}>
                  Tổng: {calculateTotal().toLocaleString()} VNĐ
                </Title>
                <Button 
                  type="primary" 
                  size="large"
                  icon={<DollarOutlined />}
                  onClick={createOrder} 
                  loading={loading}
                  style={{ height: "48px", padding: "0 30px", fontSize: "16px" }}
                >
                  Thanh Toán
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Card>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", fontSize: "20px", color: "#1890ff" }}>
            <WalletOutlined style={{ marginRight: "10px" }} /> Yêu cầu nạp tiền
          </div>
        }
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        width={700}
        footer={null}
        centered
      >
        <div style={{ padding: "10px 0" }}>
          <Alert
            message={
              <div style={{ textAlign: "center", padding: "10px" }}>
                <div style={{ fontSize: "16px", marginBottom: "8px" }}>
                  Số dư ví của bạn: <Text strong style={{ fontSize: "18px" }}>{userBalance.toLocaleString()} VNĐ</Text>
                </div>
                <div style={{ fontSize: "16px" }}>
                  Số tiền cần thanh toán: <Text type="danger" strong style={{ fontSize: "18px" }}>{orderDetail?.totalPrice.toLocaleString()} VNĐ</Text>
                </div>
              </div>
            }
            type="warning"
            style={{ marginBottom: "24px" }}
          />

          <div style={{ marginBottom: "24px", textAlign: "center" }}>
            <Text style={{ display: "block", marginBottom: "12px", fontSize: "16px" }}>
              Chọn số tiền nạp nhanh:
            </Text>
            <Space size="middle">
              {presetAmounts.map(amount => (
                <Button 
                  key={amount} 
                  type={paymentAmount === amount.toString() ? "primary" : "default"}
                  size="large"
                  onClick={() => selectPresetAmount(amount)}
                  style={{ minWidth: "120px", height: "44px" }}
                >
                  {amount.toLocaleString()} VNĐ
                </Button>
              ))}
            </Space>
          </div>

          <Divider plain>Hoặc</Divider>

          <div style={{ display: "flex", marginBottom: "24px" }}>
            <Input
              size="large"
              placeholder="Nhập số tiền khác"
              value={paymentAmount}
              onChange={handlePaymentAmountChange}
              type="number"
              min="0"
              suffix="VNĐ"
              style={{ marginRight: "12px", fontSize: "16px" }}
            />
            <Button 
              type="primary" 
              size="large"
              icon={<QrcodeOutlined />}
              onClick={generateQrCode}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
            >
              Tạo mã QR
            </Button>
          </div>

          {qrCode && (
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <Card 
                style={{ 
                  backgroundColor: "#f9f9f9", 
                  borderRadius: "8px",
                  padding: "10px"
                }}
              >
                <div style={{ padding: "15px", backgroundColor: "white", display: "inline-block", borderRadius: "8px" }}>
                  <img 
                    src={qrCode} 
                    alt="Payment QR Code" 
                    style={{ maxWidth: "100%", maxHeight: "300px" }} 
                  />
                </div>
                <div style={{ margin: "20px 0 10px" }}>
                  <Text type="secondary" style={{ display: "block", marginBottom: "10px" }}>
                    Quét mã QR để chuyển <Text strong>{parseInt(paymentAmount).toLocaleString()} VNĐ</Text>
                  </Text>
                  <Text type="secondary" style={{ fontSize: "12px", display: "block" }}>
                    Mã giao dịch: <Text code>{transactionCode}</Text>
                  </Text>
                </div>
              </Card>

              <Button
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={checkTransaction}
                loading={checkingPayment}
                style={{ marginTop: "24px", height: "48px", width: "100%" }}
              >
                {checkingPayment ? "Đang kiểm tra thanh toán..." : "Xác nhận đã thanh toán"}
              </Button>
            </div>
          )}

          {checkingPayment && (
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <Spin tip="Đang kiểm tra trạng thái thanh toán..." />
              <p style={{ marginTop: "12px" }}>Vui lòng chờ trong khi hệ thống xác minh thanh toán của bạn...</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
    </div>
  );
};

export default CartPage;