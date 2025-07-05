import React, { useState, useEffect } from 'react';
import { 
  DollarOutlined, 
  FileDoneOutlined, 
  BarChartOutlined, 
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

const AdminDashboardPage = () => {
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading recent activity
    setTimeout(() => {
      setRecentActivity([
        {
          id: 1,
          type: 'policy',
          action: 'New policy created',
          details: 'Auto Insurance - John Smith',
          time: '2 hours ago',
          status: 'success'
        },
        {
          id: 2,
          type: 'claim',
          action: 'Claim submitted',
          details: 'Claim #CLM-2024-001',
          time: '4 hours ago',
          status: 'pending'
        },
        {
          id: 3,
          type: 'quote',
          action: 'Quote generated',
          details: 'Home Insurance - Sarah Johnson',
          time: '6 hours ago',
          status: 'success'
        },
        {
          id: 4,
          type: 'user',
          action: 'New customer registered',
          details: 'Mike Wilson',
          time: '1 day ago',
          status: 'success'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const cardData = [
    {
      title: 'Total Policies',
      value: '1,247',
      change: '+12%',
      changeType: 'increase',
      icon: <FileDoneOutlined style={{ color: '#007bff', fontSize: '2rem' }} />,
      color: '#e3f0ff',
      link: '/admin/policies'
    },
    {
      title: 'Active Claims',
      value: '42',
      change: '+5%',
      changeType: 'increase',
      icon: <BarChartOutlined style={{ color: '#28a745', fontSize: '2rem' }} />,
      color: '#eafaf1',
      link: '/admin/claims'
    },
    {
      title: 'Monthly Quotes',
      value: '89',
      change: '+18%',
      changeType: 'increase',
      icon: <FileTextOutlined style={{ color: '#ffc107', fontSize: '2rem' }} />,
      color: '#fffbe6',
      link: '/admin/quotes'
    },
    {
      title: 'Revenue (MTD)',
      value: '$52,847',
      change: '+8%',
      changeType: 'increase',
      icon: <DollarOutlined style={{ color: '#17a2b8', fontSize: '2rem' }} />,
      color: '#e6f7fa',
      link: '/admin/reports'
    },
  ];

  const quickActions = [
    {
      title: 'Create Policy',
      icon: <PlusOutlined />,
      link: '/admin/policies/new',
      color: '#007bff'
    },
    {
      title: 'New Quote',
      icon: <FileTextOutlined />,
      link: '/admin/quotes/new',
      color: '#28a745'
    },
    {
      title: 'File Claim',
      icon: <BarChartOutlined />,
      link: '/admin/claims/new',
      color: '#ffc107'
    },
    {
      title: 'Add Customer',
      icon: <UserOutlined />,
      link: '/admin/customers/new',
      color: '#17a2b8'
    }
  ];

  const cardStyle = {
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    padding: '24px',
    marginBottom: '20px',
    gap: '18px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    border: '1px solid #f0f0f0'
  };

  const iconWrapStyle = (bg) => ({
    background: bg,
    borderRadius: '50%',
    width: '56px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const quickActionStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    textDecoration: 'none',
    color: '#333',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    border: '1px solid #f0f0f0'
  };

  const activityItemStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0',
    gap: '12px'
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#28a745';
      case 'pending': return '#ffc107';
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'policy': return <FileDoneOutlined style={{ color: '#007bff' }} />;
      case 'claim': return <BarChartOutlined style={{ color: '#28a745' }} />;
      case 'quote': return <FileTextOutlined style={{ color: '#ffc107' }} />;
      case 'user': return <UserOutlined style={{ color: '#17a2b8' }} />;
      default: return <ClockCircleOutlined style={{ color: '#6c757d' }} />;
    }
  };

  return (
    <MainLayout>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {cardData.map((card) => (
          <Link key={card.title} to={card.link} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div 
              style={cardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
              }}
            >
              <div style={iconWrapStyle(card.color)}>{card.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>{card.title}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '4px' }}>{card.value}</div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: card.changeType === 'increase' ? '#28a745' : '#dc3545',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {card.changeType === 'increase' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {card.change} from last month
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Quick Actions */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 600 }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {quickActions.map((action) => (
              <Link key={action.title} to={action.link} style={{ textDecoration: 'none' }}>
                <div 
                  style={quickActionStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                  }}
                >
                  <div style={{ 
                    fontSize: '1.5rem', 
                    color: action.color, 
                    marginBottom: '8px',
                    background: `${action.color}15`,
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {action.icon}
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{action.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: 600 }}>Recent Activity</h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Loading...</div>
          ) : (
            <div>
              {recentActivity.map((activity) => (
                <div key={activity.id} style={activityItemStyle}>
                  <div style={{ 
                    background: `${getStatusColor(activity.status)}15`,
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getTypeIcon(activity.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '2px' }}>
                      {activity.action}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {activity.details}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#999' }}>
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;
