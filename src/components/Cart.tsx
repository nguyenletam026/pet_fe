import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../Base_Api";
import { Button, Modal, Input, Spin, Alert, Card, List, Image, Typography, Row, Col } from "antd";
import { ShoppingCartOutlined, DollarOutlined, LoadingOutlined } from "@ant-design/icons";
import Header from "./Header";

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
      console.log("Order Details Response:", response.data); // Log full response for debugging

        const details = response.data.result;
        setOrderDetail(details);
        setOrderId(details.id); // Sync orderId with orderDetail.id
        await getUserBalance();
      
    } catch (error) {
      console.error("Error getting order details:", error);
      setError("Failed to get order details");
    }
  };

  const getUserBalance = async () => {
    try {
      const response = await axiosInstance.get<UserBalance>("/users/myInfo");
      if (response.data.code === 1000) {
        setUserBalance(response.data.result.balance as any);
        if (orderDetail && orderDetail.totalPrice > response.data.result.balance) {
          setPaymentModalVisible(true);
        } else if (orderDetail && orderId) {
          await payOrder(orderId); // Use orderId from state
        } else {
          setError("Order ID or order details not available for payment");
        }
      }
    } catch (error) {
      console.error("Error getting user balance:", error);
      setError("Failed to get user balance");
    }
  };

  const handlePaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentAmount(e.target.value);
  };

  const generateQrCode = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError("Please enter a valid amount to top up");
      return;
    }
    const amount = paymentAmount;
    const des = generateRandomString();
    setTransactionCode(des);

    const qrUrl = `https://qr.sepay.vn/img?acc=04128789601&bank=TPBANK&amount=${amount}&des=${des}&template=TEMPLATE&download=DOWNLOAD`;
    setQrCode(qrUrl);
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
        <Alert
          message="Order Successful!"
          description="Your order has been successfully paid and is now being processed."
          type="success"
          showIcon
        />
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <Button type="primary" onClick={() => (window.location.href = "/home")}>
            Tiếp tục Mua Sắm
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", backgroundColor: "#fef2f2" }}>
        <Header />
        <Alert message="Error" description={error} type="error" showIcon />
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <Button onClick={() => setError(null)}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
        <Header />
      <Card>
        <Title level={2}>
          <ShoppingCartOutlined /> Giỏ Hàng
        </Title>

        {cartItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <ShoppingCartOutlined style={{ fontSize: "48px", color: "#ccc" }} />
            <p style={{ marginTop: "20px" }}>Your cart is empty</p>
            <Button type="primary" href="/products?type=FOOD" style={{ marginTop: "20px" }}>
              Tiếp Tục Mua Sắm
            </Button>
          </div>
        ) : (
          <>
            <List
              itemLayout="horizontal"
              dataSource={cartItems}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Image width={80} src={item.product?.image || "https://placeholder.com/80"} />}
                    title={item.product?.name || `Product #${item.productId}`}
                    description={`Giá: ${item.product?.price || 0}`}
                  />
                  <div>
                    <Text>Số Lượng: {item.quantity}</Text>
                    <br />
                    <Text strong>Giá: {((item.product?.price || 0) * item.quantity).toFixed(2)}</Text>
                  </div>
                </List.Item>
              )}
            />

            <Row justify="end" style={{ marginTop: "20px" }}>
              <Col>
                <Title level={4}>Tổng: {calculateTotal().toFixed(2)} VNĐ</Title>
                <Button type="primary" size="large" onClick={createOrder} loading={loading}>
                  Thanh Toán
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Card>

      <Modal
        title="Additional Payment Required"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
      >
        <div style={{ textAlign: "center" }}>
          <Alert
            message={`Your balance: ${typeof userBalance === "number" ? userBalance.toFixed(2) : "0.00"} is insufficient for this order ($${
              orderDetail?.totalPrice.toFixed(2)
            })`}
            type="warning"
            style={{ marginBottom: "20px" }}
          />

          <Input
            addonBefore=""
            placeholder="Enter amount to top up"
            value={paymentAmount}
            onChange={handlePaymentAmountChange}
            style={{ marginBottom: "20px" }}
            type="number"
            min="0"
          />

          <Button type="primary" onClick={generateQrCode} style={{ marginBottom: "20px" }}>
            Generate Payment QR
          </Button>

          {qrCode && (
            <div style={{ marginTop: "20px" }}>
              <img src={qrCode} alt="Payment QR Code" style={{ maxWidth: "100%" }} />
              <Button
                type="primary"
                onClick={checkTransaction}
                loading={checkingPayment}
                style={{ marginTop: "20px" }}
              >
                {checkingPayment ? "Checking Payment..." : "Confirm Payment"}
              </Button>
            </div>
          )}

          {checkingPayment && (
            <div style={{ marginTop: "20px" }}>
              <Spin tip="Checking payment status..." />
              <p>Please wait while we verify your payment...</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CartPage;