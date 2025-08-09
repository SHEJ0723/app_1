import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { getUsers, addUser, updateUser, deleteUser } from '../api/users';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentUser(null);
    form.resetFields();
    setVisible(true);
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    form.setFieldsValue(user);
    setVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      message.success('删除用户成功');
      fetchUsers();
    } catch (error) {
      message.error('删除用户失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (currentUser) {
        await updateUser(currentUser.id, values);
        message.success('更新用户成功');
      } else {
        await addUser(values);
        message.success('添加用户成功');
      }
      setVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
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
          <Button type="text" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="text" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>添加用户</Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="id"
        loading={loading}
      />
      <Modal
        title={currentUser ? '编辑用户' : '添加用户'}
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
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: !currentUser, message: '请输入密码' }]}
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