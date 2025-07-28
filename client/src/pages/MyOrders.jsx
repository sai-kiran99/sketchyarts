import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    axios.get('http://localhost:5000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      setOrders(res.data.orders.reverse());
    });
  }, [navigate]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-purple-800 mb-4">📜 All Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map(order => (
          <div key={order._id} className="bg-white rounded shadow p-4 mb-4 text-sm space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Order #{order._id.slice(-5)}</span>
              <span>{new Date(order.date).toLocaleDateString()}</span>
            </div>
            <p>Status: <strong>{order.status}</strong></p>
            <p>Total: ₹{order.total}</p>
            <p>Payment: {order.paymentMethod}</p>
            <p>Address: {order.address?.fullAddress}, {order.address?.city}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
