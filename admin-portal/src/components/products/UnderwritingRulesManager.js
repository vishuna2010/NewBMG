import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  Tooltip,
  Typography,
  Tag,
  message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  getUnderwritingRulesForProduct,
  createUnderwritingRule,
  updateUnderwritingRule,
  deleteUnderwritingRule,
} from '../../services/underwritingRuleService';

const { Option } = Select;
const { Text } = Typography;

const UnderwritingRulesManager = ({ productId }) => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form] = Form.useForm();

  const ruleActionOptions = ['REJECT', 'FLAG_FOR_REVIEW', 'AUTO_APPROVE', 'REFER_TO_UNDERWRITER'];
  const ruleActionColor = {
    REJECT: 'red',
    FLAG_FOR_REVIEW: 'orange',
    AUTO_APPROVE: 'green',
    REFER_TO_UNDERWRITER: 'blue',
  };

  const fetchRules = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const response = await getUnderwritingRulesForProduct(productId);
      setRules(response.data || []);
    } catch (error) {
      message.error(`Failed to fetch underwriting rules: ${error.message}`);
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleOpenModal = (rule = null) => {
    setEditingRule(rule);
    form.resetFields();
    if (rule) {
      form.setFieldsValue({
        ...rule,
        isActive: rule.isActive !== undefined ? rule.isActive : true,
        priority: rule.priority !== undefined ? rule.priority : 100,
      });
    } else {
      form.setFieldsValue({
        isActive: true,
        action: 'FLAG_FOR_REVIEW',
        priority: 100,
      });
    }
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setEditingRule(null);
    form.resetFields();
  };

  const handleFormSubmit = async (values) => {
    setLoading(true);
    const ruleData = { ...values };
    try {
      if (editingRule) {
        await updateUnderwritingRule(editingRule._id, ruleData);
        message.success('Underwriting rule updated successfully!');
      } else {
        await createUnderwritingRule(productId, ruleData);
        message.success('Underwriting rule created successfully!');
      }
      fetchRules(); // Refresh the list
      handleCancelModal();
    } catch (error) {
      message.error(`Failed to save rule: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this underwriting rule?')) return;
    setLoading(true);
    try {
      await deleteUnderwritingRule(ruleId);
      message.success('Underwriting rule deleted successfully!');
      fetchRules(); // Refresh the list
    } catch (error) {
      message.error(`Failed to delete rule: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Rule Name',
      dataIndex: 'ruleName',
      key: 'ruleName',
      sorter: (a, b) => a.ruleName.localeCompare(b.ruleName),
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
      ellipsis: true,
      render: (text) => <Tooltip title={text}><Text style={{maxWidth: '200px'}} ellipsis={true}>{text}</Text></Tooltip>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => <Tag color={ruleActionColor[action] || 'default'}>{action.replace(/_/g, ' ')}</Tag>,
      filters: ruleActionOptions.map(opt => ({text: opt.replace(/_/g, ' '), value: opt})),
      onFilter: (value, record) => record.action.indexOf(value) === 0,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      sorter: (a, b) => a.priority - b.priority,
      align: 'center',
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Yes' : 'No'}</Tag>,
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      align: 'center',
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit Rule">
            <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} size="small" />
          </Tooltip>
          <Tooltip title="Delete Rule">
            <Button icon={<DeleteOutlined />} onClick={() => handleDeleteRule(record._id)} size="small" danger />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ marginTop: '20px' }}>
      <Typography.Title level={4} style={{ marginBottom: '20px' }}>
        Manage Underwriting Rules
      </Typography.Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => handleOpenModal()}
        style={{ marginBottom: 16 }}
        disabled={!productId}
      >
        Add New Rule
      </Button>
      {!productId && <Text type="warning" style={{display: 'block', marginBottom: '16px'}}>Product must be saved before adding underwriting rules.</Text>}

      <Table
        columns={columns}
        dataSource={rules}
        loading={loading}
        rowKey="_id"
        size="middle"
        bordered
      />

      <Modal
        title={editingRule ? 'Edit Underwriting Rule' : 'Add New Underwriting Rule'}
        visible={isModalVisible}
        onCancel={handleCancelModal}
        footer={null} // Custom footer below
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ isActive: true, action: 'FLAG_FOR_REVIEW', priority: 100 }}
        >
          <Form.Item
            name="ruleName"
            label="Rule Name"
            rules={[{ required: true, message: 'Please input the rule name!' }]}
          >
            <Input placeholder="e.g., Age Check for Auto Insurance" />
          </Form.Item>

          <Form.Item
            name="condition"
            label={
                <Space>
                    Condition
                    <Tooltip title="Define the rule condition. E.g., 'age < 18', 'vehicle.year < 2005', 'customer.address.state === &quot;CA&quot;'. This will be evaluated by the backend.">
                        <QuestionCircleOutlined />
                    </Tooltip>
                </Space>
            }
            rules={[{ required: true, message: 'Please input the condition!' }]}
          >
            <Input.TextArea rows={2} placeholder="e.g., age < 18 OR claims.history.count > 3" />
          </Form.Item>

          <Form.Item
            name="action"
            label="Action"
            rules={[{ required: true, message: 'Please select an action!' }]}
          >
            <Select placeholder="Select an action">
              {ruleActionOptions.map(opt => (
                <Option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description (Optional)"
          >
            <Input.TextArea rows={2} placeholder="Briefly describe what this rule does or why it's in place." />
          </Form.Item>

          <Form.Item
            name="priority"
            label={
                <Space>
                    Priority
                    <Tooltip title="Lower numbers run first. Default is 100.">
                        <QuestionCircleOutlined />
                    </Tooltip>
                </Space>
            }
            rules={[{ required: true, message: 'Please input the priority!' }]}
          >
            <Input type="number" defaultValue={100}/>
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginTop: '20px' }}>
            <Button onClick={handleCancelModal} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingRule ? 'Save Changes' : 'Create Rule'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UnderwritingRulesManager;
