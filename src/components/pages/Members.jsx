import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlus, Mail, Shield, Calendar, Users, RefreshCw } from 'lucide-react';
import { inviteUser, fetchUsers } from '../../store/slices/authSlice';
import { Button, Input, Card, Modal, Loading } from '../common';

const Members = () => {
  const dispatch = useDispatch();
  const { 
    users, 
    usersPagination, 
    accountStats, 
    isLoading, 
    user: currentUser 
  } = useSelector((state) => state.auth);
  
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [resendModalOpen, setResendModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: ''
  });
  const [inviteErrors, setInviteErrors] = useState({});

  useEffect(() => {
    loadUsers();
  }, [dispatch]);

  const loadUsers = () => {
    dispatch(fetchUsers({ page: 1, limit: 10 }));
  };

  const validateInviteForm = () => {
    const errors = {};
    
    if (!inviteForm.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!inviteForm.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(inviteForm.email)) {
      errors.email = 'Email is invalid';
    }
    
    // Check if email already exists
    const emailExists = users.some(user => 
      user.email.toLowerCase() === inviteForm.email.toLowerCase()
    );
    
    if (emailExists) {
      errors.email = 'User with this email already exists';
    }
    
    setInviteErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInviteInputChange = (e) => {
    const { name, value } = e.target;
    setInviteForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (inviteErrors[name]) {
      setInviteErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    
    if (validateInviteForm()) {
      dispatch(inviteUser(inviteForm))
        .unwrap()
        .then(() => {
          setInviteModalOpen(false);
          setInviteForm({ name: '', email: '' });
          setInviteErrors({});
          // Refresh users list
          loadUsers();
        })
        .catch(() => {
          // Error handled by the slice
        });
    }
  };

  const handleResendInvite = (user) => {
    setSelectedUser(user);
    setResendModalOpen(true);
  };

  const confirmResendInvite = () => {
    if (selectedUser) {
      dispatch(inviteUser({
        name: selectedUser.name,
        email: selectedUser.email
      }))
        .unwrap()
        .then(() => {
          setResendModalOpen(false);
          setSelectedUser(null);
          loadUsers();
        })
        .catch(() => {
          // Error handled by the slice
        });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800'
    };

    const displayStatus = status ? 'active' : 'pending';

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[displayStatus]}`}>
        {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleStyles = {
      admin: 'bg-purple-100 text-purple-800',
      member: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleStyles[role] || roleStyles.member}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const handlePageChange = (newPage) => {
    dispatch(fetchUsers({ page: newPage, limit: usersPagination.limit }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600">
            Manage your team members and send invitations
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadUsers}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setInviteModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-semibold text-gray-900">{accountStats.totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-2xl font-semibold text-gray-900">{accountStats.totalActiveUsers}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Mail className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Invites</p>
              <p className="text-2xl font-semibold text-gray-900">
                {accountStats.totalUsers - accountStats.totalActiveUsers}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Members Table */}
      <Card title="All Members">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loading size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Password
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const isCurrentUser = user.id === currentUser?.user_id;
                    
                    return (
                      <tr key={user.id} className={isCurrentUser ? 'bg-primary-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className={`h-10 w-10 rounded-full ${
                                isCurrentUser ? 'bg-primary-100' : 'bg-gray-100'
                              } flex items-center justify-center`}>
                                <span className={`${
                                  isCurrentUser ? 'text-primary-600' : 'text-gray-600'
                                } font-medium text-sm`}>
                                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name} {isCurrentUser && '(You)'}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {"password"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user.isActive)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {/* {!user.isActive && !isCurrentUser && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleResendInvite(user)}
                              >
                                Resend Invite
                              </Button>
                            )} */}
                            {/* {!isCurrentUser && user.role !== 'admin' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 hover:text-red-800"
                                onClick={() => {
                                  // TODO: Implement remove user functionality
                                  console.log('Remove user:', user.id);
                                }}
                              >
                                Remove
                              </Button>
                            )} */}
                            {isCurrentUser && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                Current User
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-900 mb-2">No team members yet</p>
                <p className="text-gray-600 mb-4">
                  Start building your team by inviting members to collaborate on notes.
                </p>
                <Button onClick={() => setInviteModalOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Send First Invitation
                </Button>
              </div>
            )}

            {/* Pagination */}
            {usersPagination.pages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(usersPagination.page - 1)}
                    disabled={usersPagination.page <= 1}
                  >
                    Previous
                  </Button>
                  
                  {[...Array(usersPagination.pages)].map((_, index) => (
                    <Button
                      key={index + 1}
                      size="sm"
                      variant={usersPagination.page === index + 1 ? 'primary' : 'outline'}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(usersPagination.page + 1)}
                    disabled={usersPagination.page >= usersPagination.pages}
                  >
                    Next
                  </Button>
                </nav>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Invite Member Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Team Member"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="Enter member's full name"
            value={inviteForm.name}
            onChange={handleInviteInputChange}
            error={inviteErrors.name}
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="Enter member's email address"
            value={inviteForm.email}
            onChange={handleInviteInputChange}
            error={inviteErrors.email}
            required
          />

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">
                  What happens next?
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  An invitation email will be sent to the member. They'll need to set up their password before they can access the system.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Resend Invite Modal */}
      <Modal
        isOpen={resendModalOpen}
        onClose={() => setResendModalOpen(false)}
        title="Resend Invitation"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to resend the invitation to <strong>{selectedUser?.name}</strong> ({selectedUser?.email})?
          </p>
          <p className="text-sm text-gray-500">
            A new invitation email with a fresh activation link will be sent.
          </p>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setResendModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmResendInvite}
              loading={isLoading}
            >
              Resend Invitation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Members;