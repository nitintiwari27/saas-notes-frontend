import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { User, Mail, Shield, Calendar, Building, Key } from 'lucide-react';
import { Button, Card } from '../common';

const Profile = () => {
  const { user, account } = useSelector((state) => state.auth);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <Link to="/change-password">
          <Button>
            <Key className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information */}
        <Card title="User Information">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-full">
                <User className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium text-gray-900">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-full">
                <Mail className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email Address</p>
                <p className="font-medium text-gray-900">{user?.email_id}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-full">
                <Shield className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium text-gray-900 capitalize">
                  {user?.role}
                  {user?.role === 'admin' && (
                    <span className="ml-2 px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                      Administrator
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-full">
                <Calendar className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Login</p>
                <p className="font-medium text-gray-900">
                  {user?.last_login ? formatDate(user.last_login) : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Information */}
        {account && (
          <Card title="Account Information">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Building className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account ID</p>
                  <p className="font-medium text-gray-900">{account.account_id}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Slug</p>
                  <p className="font-medium text-gray-900">{account.slug}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Plan</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {account.plan}
                    {account.plan === 'pro' && (
                      <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Premium
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Status</p>
                  <p className={`font-medium ${
                    account.account_active ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {account.account_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Calendar className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Created</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(account.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Usage Statistics */}
      <Card title="Usage Statistics">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {account?.note_count || 0}
            </div>
            <p className="text-sm text-gray-600">Notes Created</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {account?.limit === -1 ? '∞' : account?.limit || 3}
            </div>
            <p className="text-sm text-gray-600">Notes Limit</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {account?.limit === -1 
                ? '100%' 
                : `${Math.round(((account?.note_count || 0) / (account?.limit || 3)) * 100)}%`
              }
            </div>
            <p className="text-sm text-gray-600">Usage</p>
          </div>
        </div>

        {account?.limit !== -1 && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Storage Used</span>
              <span>{account?.note_count || 0} / {account?.limit || 3} notes</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  (account?.note_count || 0) >= (account?.limit || 3) 
                    ? 'bg-red-500' 
                    : 'bg-primary-600'
                }`}
                style={{ 
                  width: `${Math.min(((account?.note_count || 0) / (account?.limit || 3)) * 100, 100)}%` 
                }}
              />
            </div>
            {(account?.note_count || 0) >= (account?.limit || 3) && (
              <p className="text-sm text-red-600 mt-2">
                You've reached your notes limit. 
                {user?.role === 'admin' && account?.plan === 'free' && (
                  <>
                    {' '}
                    <Link to="/subscription" className="underline">
                      Upgrade to Pro
                    </Link>
                    {' '}for unlimited notes.
                  </>
                )}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/notes">
            <Button variant="outline" className="w-full">
              View Notes
            </Button>
          </Link>
          <Link to="/notes/create">
            <Button variant="outline" className="w-full">
              Create Note
            </Button>
          </Link>
          <Link to="/change-password">
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
          </Link>
          {user?.role === 'admin' && (
            <Link to="/subscription">
              <Button variant="outline" className="w-full">
                Manage Subscription
              </Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile;