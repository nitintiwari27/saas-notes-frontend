import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  CreditCard, 
  TrendingUp,
  Plus,
  Eye
} from 'lucide-react';
import { fetchProfile } from '../../store/slices/authSlice';
import { fetchNotes } from '../../store/slices/notesSlice';
import { fetchMySubscription } from '../../store/slices/subscriptionSlice';
import { Card, Button, Loading } from '../common';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, account } = useSelector((state) => state.auth);
  const { notes, isLoading: notesLoading } = useSelector((state) => state.notes);
  const { currentSubscription, account: subscriptionAccount } = useSelector((state) => state.subscription);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchNotes({ limit: 5 }));
    if (isAdmin) {
      dispatch(fetchMySubscription());
    }
  }, [dispatch, isAdmin]);

  const stats = [
    {
      name: 'Total Notes',
      value: account?.note_count || 0,
      icon: FileText,
      color: 'bg-blue-500',
      link: '/notes'
    },
    {
      name: 'Plan',
      value: account?.plan?.toUpperCase() || 'FREE',
      icon: CreditCard,
      color: 'bg-green-500',
      link: isAdmin ? '/subscription' : null
    },
    {
      name: 'Notes Limit',
      value: account?.limit === -1 ? 'Unlimited' : account?.limit || 3,
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ];

  if (isAdmin) {
    stats.push({
      name: 'Members',
      value: 'Manage',
      icon: Users,
      color: 'bg-orange-500',
      link: '/members'
    });
  }

  const canCreateNote = account?.note_count < account?.limit || account?.limit === -1;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-primary-100">
          {isAdmin ? 'Manage your team and notes from your dashboard.' : 'Here\'s what\'s happening with your notes today.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          );

          return stat.link ? (
            <Link key={stat.name} to={stat.link}>
              {content}
            </Link>
          ) : (
            <div key={stat.name}>{content}</div>
          );
        })}
      </div>

      {/* Account Status */}
      {account && (
        <Card title="Account Status">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Current Plan</h4>
              <p className="text-sm text-gray-600">
                You're on the <span className="font-semibold">{account.plan.toUpperCase()}</span> plan
              </p>
              {account.limit !== -1 && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Notes Used</span>
                    <span>{account.note_count}/{account.limit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        account.note_count >= account.limit ? 'bg-red-500' : 'bg-primary-600'
                      }`}
                      style={{ width: `${Math.min((account.note_count / account.limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Account Info</h4>
              <p className="text-sm text-gray-600">Slug: {account.slug}</p>
              <p className="text-sm text-gray-600">
                Status: <span className={`font-medium ${account.account_active ? 'text-green-600' : 'text-red-600'}`}>
                  {account.account_active ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>
          {isAdmin && account.plan === 'free' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Upgrade to Pro to get unlimited notes and advanced features.
              </p>
              <Link to="/subscription" className="mt-2 inline-block">
                <Button size="sm">Upgrade Now</Button>
              </Link>
            </div>
          )}
        </Card>
      )}

      {/* Recent Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Notes">
          <div className="space-y-3">
            {notesLoading ? (
              <Loading />
            ) : notes.length > 0 ? (
              notes.slice(0, 5).map((note) => (
                <div key={note.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 truncate">{note.title}</h4>
                    <p className="text-sm text-gray-600 truncate">{note.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {note.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          +{note.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                  <Link to={`/notes/${note.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No notes yet. Create your first note!</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-between">
            <Link to="/notes">
              <Button variant="outline" size="sm">
                View All Notes
              </Button>
            </Link>
            {canCreateNote && (
              <Link to="/notes/create">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New Note
                </Button>
              </Link>
            )}
          </div>
          {!canCreateNote && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">
                You've reached your notes limit. {isAdmin ? 'Upgrade your plan to create more notes.' : 'Contact your admin to upgrade the plan.'}
              </p>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="space-y-3">
            <Link to="/notes/create" className={!canCreateNote ? 'pointer-events-none' : ''}>
              <Button className="w-full" disabled={!canCreateNote}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Note
              </Button>
            </Link>
            
            <Link to="/notes">
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Browse All Notes
              </Button>
            </Link>

            {isAdmin && (
              <>
                <Link to="/members">
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Members
                  </Button>
                </Link>
                
                <Link to="/subscription">
                  <Button variant="outline" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                </Link>
              </>
            )}

            <Link to="/profile">
              <Button variant="outline" className="w-full">
                Settings & Profile
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;