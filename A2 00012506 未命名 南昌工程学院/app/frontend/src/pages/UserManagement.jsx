import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      message.error('获取用户列表失败');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 添加/编辑用户
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await axios.put(`/api/users/${editingId}`, values);
        message.success('用户更新成功');
      } else {
        await axios.post('/api/users', values);
        message.success('用户添加成功');
      }
      setVisible(false);
      fetchUsers();
    } catch (err) {
      message.error('操作失败');
    }
  };

  // 删除用户
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`);
      message.success('删除成功');
      fetchUsers();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <>
          <Button type="text" onClick={() => {
            setEditingId(record.id);
            form.setFieldsValue(record);
            setVisible(true);
          }}>
            编辑
          </Button>
          <Button type="text" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={() => {
        setEditingId(null);
        form.resetFields();
        setVisible(true);
      }}>
        添加用户
      </Button>

      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="id" 
        style={{ marginTop: 16 }}
      />

      <Modal
        title={editingId ? '编辑用户' : '添加用户'}
        visible={visible}
        onOk={handleSubmit}
        onCancel={() => setVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: !editingId, message: '请输入密码' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;