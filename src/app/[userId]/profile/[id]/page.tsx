'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import {
  getUserProfile,
  getUserPublicPosts,
  followUser,
  unfollowUser,
  isFollowingUser,
  updateUserProfile,
  updateUserPostsCount,
  UserProfile,
  PublicNote
} from '@/services/firebase';
import {
  Avatar,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Skeleton,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Email as EmailIcon,
  Link as LinkIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { blackColor1, grayColor3, grayColor2 } from '@/constants/color';
import { fontSize, fontSizeSmall } from '@/constants/size';

// Helper function to format dates
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  });
};

const formatPostDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProfilePage() {
  const { id } = useParams();
  const userId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const currentUser = auth.currentUser;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PublicNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<PublicNote[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editProfile, setEditProfile] = useState<Partial<UserProfile>>({});

  const isOwnProfile = currentUser?.uid === userId;

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        let userProfile = await getUserProfile(userId);

        // If profile doesn't exist, create a basic one for the user
        if (!userProfile && currentUser && isOwnProfile) {
          await updateUserProfile({
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
            bio: '',
            skills: []
          });
          userProfile = await getUserProfile(userId);
        }

        setProfile(userProfile);

        // Check follow status if viewing someone else's profile
        if (userProfile && currentUser && !isOwnProfile) {
          const followStatus = await isFollowingUser(userId);
          setIsFollowing(followStatus);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, currentUser, isOwnProfile]);

  // Load user's posts
  useEffect(() => {
    const loadPosts = async () => {
      if (!userId) return;

      try {
        setPostsLoading(true);
        const userPosts = await getUserPublicPosts(userId, 24);
        setPosts(userPosts);

        // Update posts count
        if (profile) {
          await updateUserPostsCount(userId);
        }
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setPostsLoading(false);
      }
    };

    loadPosts();
  }, [userId, profile]);

  // Filter posts based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.publishContent && post.publishContent.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPosts(filtered);
    }
  }, [posts, searchTerm]);

  const handleFollow = async () => {
    if (!currentUser || !userId) {
      toast.error('Please sign in to follow users');
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
        toast.success('Unfollowed successfully');
      } else {
        await followUser(userId);
        setIsFollowing(true);
        toast.success('Following successfully');
      }

      // Refresh profile to get updated counts
      const updatedProfile = await getUserProfile(userId);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleEditProfile = async () => {
    try {
      await updateUserProfile(editProfile);
      const updatedProfile = await getUserProfile(userId!);
      setProfile(updatedProfile);
      setEditDialogOpen(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const openEditDialog = () => {
    setEditProfile({
      displayName: profile?.displayName || '',
      bio: profile?.bio || '',
      github: profile?.github || '',
      website: profile?.website || '',
      location: profile?.location || '',
      skills: profile?.skills || []
    });
    setEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Skeleton variant="circular" width={120} height={120} />
              <div className="flex-1 text-center md:text-left">
                <Skeleton variant="text" width={200} height={32} />
                <Skeleton variant="text" width={300} height={20} sx={{ mt: 1 }} />
                <div className="flex justify-center md:justify-start gap-4 mt-4">
                  <Skeleton variant="text" width={80} height={20} />
                  <Skeleton variant="text" width={80} height={20} />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <Skeleton variant="rectangular" width="100%" height={300} />
            </div>
            <div className="md:col-span-3">
              <Skeleton variant="rectangular" width="100%" height={400} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Typography variant="h5" className="text-gray-600 dark:text-gray-400">
            User not found
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/dashboard')}
            sx={{ mt: 2 }}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: blackColor1 }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden" style={{ backgroundColor: grayColor2 }}>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <Avatar
                src={profile.avatar}
                alt={profile.displayName}
                sx={{ width: 120, height: 120 }}
                className="ring-4 ring-white dark:ring-gray-700 shadow-lg"
              >
                {profile.displayName.charAt(0).toUpperCase()}
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                  <Typography variant="h4" className="font-bold text-gray-900 dark:text-white">
                    {profile.displayName}
                  </Typography>
                  {isOwnProfile ? (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={openEditDialog}
                    >
                      Edit Profile
                    </Button>
                  ) : currentUser ? (
                    <Button
                      variant={isFollowing ? "outlined" : "contained"}
                      size="small"
                      onClick={handleFollow}
                      disabled={followLoading}
                      color={isFollowing ? "inherit" : "primary"}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  ) : null}
                </div>

                {profile.bio && (
                  <Typography variant="body1" className="text-gray-600 dark:text-gray-300 mb-4">
                    {profile.bio}
                  </Typography>
                )}

                {/* Stats */}
                <div className="flex justify-center md:justify-start gap-6 mb-4">
                  <div className="text-center">
                    <Typography variant="h6" sx={{ color: grayColor3 }}>
                      {profile.followersCount || 0}
                    </Typography>
                    <Typography variant="body2" className="text-gray-500">
                      Followers
                    </Typography>
                  </div>
                  <div className="text-center">
                    <Typography variant="h6" sx={{ color: grayColor3 }}>
                      {profile.followingCount || 0}
                    </Typography>
                    <Typography variant="body2" className="text-gray-500">
                      Following
                    </Typography>
                  </div>
                  <div className="text-center">
                    <Typography variant="h6" sx={{ color: grayColor3 }}>
                      {profile.postsCount || 0}
                    </Typography>
                    <Typography variant="body2" className="text-gray-500">
                      Posts
                    </Typography>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                  {profile.location && (
                    <Chip
                      icon={<LocationIcon />}
                      label={profile.location}
                      variant="outlined"
                      size="small"
                      sx={{ color: grayColor3 }}
                    />
                  )}
                  <Chip
                    icon={<CalendarIcon />}
                    label={`Joined ${formatDate(profile.joinedAt)}`}
                    variant="outlined"
                    size="small"
                    sx={{ color: grayColor3, padding: '8px' }}
                  />
                </div>

                {/* Social Links */}
                <div className="flex justify-center md:justify-start gap-2">
                  {profile.github && (
                    <IconButton
                      component="a"
                      href={`https://github.com/${profile.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      sx={{ color: grayColor3 }}
                    >
                      <GitHubIcon />
                    </IconButton>
                  )}
                  {profile.website && (
                    <IconButton
                      component="a"
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      sx={{ color: grayColor3 }}
                    >
                      <LinkIcon />
                    </IconButton>
                  )}
                  <IconButton
                    component="a"
                    href={`mailto:${profile.email}`}
                    size="small"
                    sx={{
                      display: 'flex',
                      gap: 1,
                      alignItems: 'center',
                      color: grayColor3,
                    }}
                  >
                    <EmailIcon sx={{ color: grayColor3, fontSize: fontSize }} />
                    <span style={{ color: grayColor3, fontSize: fontSizeSmall }}>{profile.email}</span>
                  </IconButton>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card sx={{ backgroundColor: grayColor2 }}>
              <CardContent>
                <Typography variant="h6" className="mb-3 font-semibold" sx={{ color: grayColor3 }}>
                  Skills & Interests
                </Typography>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                        variant="filled"
                        color="primary"
                        className="mb-1"
                      />
                    ))}
                  </div>
                ) : (
                  <Typography variant="body2" className="text-gray-500">
                    No skills listed yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card sx={{ backgroundColor: grayColor2 }}>
              <CardContent>
                {/* Tabs */}
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  className="mb-4"
                  sx={{
                    color: grayColor3,
                    '& .MuiTabs-indicator': {
                      backgroundColor: grayColor3,
                    },
                  }}
                >
                  <Tab label="Posts" sx={{ color: grayColor3 }} />
                  <Tab label="Series" sx={{ color: grayColor3 }} />
                  <Tab label="About" sx={{ color: grayColor3 }} />
                </Tabs>

                {/* Posts Tab */}
                <TabPanel value={activeTab} index={0}>
                  {/* Search */}
                  <TextField
                    fullWidth
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: grayColor3 }} />
                        </InputAdornment>
                      ),
                    }}
                    size="small"
                    sx={{
                      color: grayColor3,
                      '& .MuiInputBase-input': {
                        color: grayColor3,
                        fontSize: fontSize,
                      },
                      '& .MuiInputBase-root': {
                        borderColor: grayColor3,
                        borderWidth: '1px',
                        borderRadius: '8px',
                        padding: '4px 8px',
                        backgroundColor: grayColor2,
                        '&:hover': {
                          borderColor: grayColor3,
                        },
                      },
                      marginBottom: '24px',
                    }}
                  />

                  {/* Posts Grid */}
                  {postsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, index) => (
                        <div key={index}>
                          <Skeleton variant="rectangular" height={200} />
                        </div>
                      ))}
                    </div>
                  ) : filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {filteredPosts.map((post) => (
                        <Link
                          key={post.id}
                          href={`/note/${post.id}`}
                          className="block h-full"
                        >
                          <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow duration-200" sx={{ backgroundColor: grayColor2 }}>
                            <CardContent className="p-4" sx={{ color: grayColor3 }}>
                              <Typography
                                variant="h6"
                                className="font-semibold mb-2 line-clamp-2"
                                sx={{
                                  display: '-webkit-box',
                                  overflow: 'hidden',
                                  WebkitBoxOrient: 'vertical',
                                  WebkitLineClamp: 2,
                                }}
                              >
                                {post.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-3"
                                sx={{
                                  display: '-webkit-box',
                                  overflow: 'hidden',
                                  WebkitBoxOrient: 'vertical',
                                  WebkitLineClamp: 3,
                                }}
                              >
                                {post.publishContent || 'No preview available'}
                              </Typography>
                              <Typography variant="caption" className="text-gray-500">
                                {formatPostDate(post.updatedAt)}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Typography variant="h6" className="text-gray-500 mb-2">
                        No posts found
                      </Typography>
                      <Typography variant="body2" className="text-gray-400">
                        {searchTerm ? 'Try adjusting your search terms' : 'No public posts yet'}
                      </Typography>
                    </div>
                  )}
                </TabPanel>

                {/* Series Tab */}
                <TabPanel value={activeTab} index={1}>
                  <div className="text-center py-12">
                    <Typography variant="h6" className="text-gray-500 mb-2">
                      Series Coming Soon
                    </Typography>
                    <Typography variant="body2" className="text-gray-400">
                      Post series functionality will be available soon
                    </Typography>
                  </div>
                </TabPanel>

                {/* About Tab */}
                <TabPanel value={activeTab} index={2}>
                  <div className="prose dark:prose-invert max-w-none">
                    <Typography variant="h6" className="mb-4">About {profile.displayName}</Typography>
                    {profile.bio ? (
                      <Typography variant="body1" className="whitespace-pre-wrap">
                        {profile.bio}
                      </Typography>
                    ) : (
                      <Typography variant="body2" className="text-gray-500 italic">
                        No bio available
                      </Typography>
                    )}
                  </div>
                </TabPanel>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-2">
            <TextField
              fullWidth
              label="Display Name"
              value={editProfile.displayName || ''}
              onChange={(e) => setEditProfile({ ...editProfile, displayName: e.target.value })}
            />
            <TextField
              fullWidth
              label="Bio"
              multiline
              rows={3}
              value={editProfile.bio || ''}
              onChange={(e) => setEditProfile({ ...editProfile, bio: e.target.value })}
            />
            <TextField
              fullWidth
              label="GitHub Username"
              value={editProfile.github || ''}
              onChange={(e) => setEditProfile({ ...editProfile, github: e.target.value })}
            />
            <TextField
              fullWidth
              label="Website"
              value={editProfile.website || ''}
              onChange={(e) => setEditProfile({ ...editProfile, website: e.target.value })}
            />
            <TextField
              fullWidth
              label="Location"
              value={editProfile.location || ''}
              onChange={(e) => setEditProfile({ ...editProfile, location: e.target.value })}
            />
            <TextField
              fullWidth
              label="Skills (comma separated)"
              value={editProfile.skills?.join(', ') || ''}
              onChange={(e) => setEditProfile({
                ...editProfile,
                skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              helperText="Add your skills separated by commas"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditProfile} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
