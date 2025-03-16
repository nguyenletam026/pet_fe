import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../Base_Api";
import { 
  Card, Typography, List, Image, Spin, Empty, Collapse, Badge, 
  Divider, Tag, Row, Col, Alert 
} from "antd";
import { 
  ShoppingOutlined, HistoryOutlined, ClockCircleOutlined,
  DollarOutlined, LoadingOutlined
} from "@ant-design/icons";
import Header from "./Header";
import { format } from "date-fns";
import { div } from "framer-motion/client";

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface OrderItem {
  productName: string;
  productImage: string;
  productPrice: number;
  quantity: number;
}

interface Order {
  id: number | null;
  orderTime: string;
  totalPrice: number;
  status: string | null;
  user: any;
  orderItems: OrderItem[];
}

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/orders/getMyOrders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (response.data.code === 1000) {
        // Sort orders by date (newest first)
        const sortedOrders = response.data.result.sort((a: Order, b: Order) => 
          new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime()
        );
        setOrders(sortedOrders);
      } else {
        setError("Failed to fetch order history");
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
      setError("An error occurred while fetching your order history");
    } finally {
      setLoading(false);
    }
  };

  // Format date for better display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm");
    } catch (e) {
      return dateString;
    }
  };

  // Map status to Vietnamese text and color
  const getStatusInfo = (status: string | null) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return { text: "Đã Thanh Toán", color: "green" };
      case "PENDING":
        return { text: "Chờ Thanh Toán", color: "orange" };
      case "ACCEPT":
        return { text: "Chờ Giao Hàng", color: "blue" };
      case "SUCCESS":
        return { text: "Đã Giao Hàng", color: "purple" };
      default:
        return { text: "Trạng thái không xác định", color: "gray" };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <Header />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} 
            tip="Đang tải lịch sử đơn hàng..." 
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <Header />
        <Alert 
          message="Lỗi" 
          description={error} 
          type="error" 
          showIcon 
          style={{ maxWidth: "800px", margin: "40px auto" }}
        />
      </div>
    );
  }

  return (
    <div>
        <Header />
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      
      
      <Card 
        style={{ 
          borderRadius: "8px", 
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          marginBottom: "20px" 
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
          <HistoryOutlined style={{ fontSize: "28px", color: "#1890ff", marginRight: "16px" }} />
          <Title level={2} style={{ margin: 0, color: "#1890ff" }}>Lịch sử đơn hàng</Title>
        </div>

        {orders.length === 0 ? (
          <Empty 
            description="Bạn chưa có đơn hàng nào" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: "40px 0" }}
          />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={orders}
            renderItem={(order, index) => {
              const statusInfo = getStatusInfo(order.status);
              return (
                <Card 
                  key={index}
                  style={{ 
                    marginBottom: "20px", 
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    borderLeft: `4px solid ${statusInfo.color === "green" ? "#52c41a" : statusInfo.color === "orange" ? "#faad14" : statusInfo.color === "blue" ? "#1890ff" : statusInfo.color === "purple" ? "#722ed1" : "#d9d9d9"}`
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                        <ClockCircleOutlined style={{ color: "#8c8c8c", marginRight: "8px" }} />
                        <Text strong style={{ fontSize: "15px" }}>
                          {formatDate(order.orderTime)}
                        </Text>
                      </div>
                      <Badge 
                        color={statusInfo.color}
                        text={
                          <Text strong style={{ fontSize: "14px", color: statusInfo.color }}>
                            {statusInfo.text}
                          </Text>
                        } 
                        style={{ marginBottom: "12px" }}
                      />
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                        <DollarOutlined style={{ color: "#ff4d4f", marginRight: "8px" }} />
                        <Text strong style={{ fontSize: "18px", color: "#ff4d4f" }}>
                          {order.totalPrice.toLocaleString()} VNĐ
                        </Text>
                      </div>
                    </div>
                  </div>

                  <Divider style={{ margin: "12px 0" }} />

                  <Collapse 
                    ghost 
                    bordered={false}
                    expandIconPosition="end"
                    defaultActiveKey={index === 0 ? ["1"] : []}
                  >
                    <Panel 
                      header={
                        <Text strong style={{ fontSize: "15px" }}>
                          <ShoppingOutlined style={{ marginRight: "8px" }} />
                          {order.orderItems.length} sản phẩm
                        </Text>
                      } 
                      key="1"
                    >
                      <List
                        itemLayout="horizontal"
                        dataSource={order.orderItems}
                        renderItem={item => (
                          <List.Item style={{ padding: "12px 0" }}>
                            <div style={{ 
                              display: "flex", 
                              width: "100%",
                              flexWrap: "wrap"
                            }}>
                              <div style={{ 
                                maxWidth: "80px", 
                                marginRight: "16px", 
                                flexShrink: 0 
                              }}>
                                <Image
                                  width={80}
                                  height={80}
                                  src={item.productImage}
                                  alt={item.productName}
                                  style={{ 
                                    objectFit: "cover", 
                                    borderRadius: "4px" 
                                  }}
                                  fallback="https://via.placeholder.com/80"
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <Text strong style={{ fontSize: "15px", display: "block", marginBottom: "4px" }}>
                                  {item.productName}
                                </Text>
                                <Text type="secondary">
                                  {item.productPrice.toLocaleString()} VNĐ × {item.quantity}
                                </Text>
                              </div>
                              <div style={{ 
                                minWidth: "100px", 
                                textAlign: "right",
                                flexShrink: 0
                              }}>
                                <Text strong style={{ color: "#ff4d4f" }}>
                                  {(item.productPrice * item.quantity).toLocaleString()} VNĐ
                                </Text>
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                    </Panel>
                  </Collapse>
                </Card>
              );
            }}
          />
        )}
      </Card>
    </div>
    </div>
  );
};

export default OrderHistoryPage;