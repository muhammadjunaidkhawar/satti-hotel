/*  === FULL UPDATED PROFILE.jsx ===
     All requested changes implemented.
     Avatar fallback → user icon
     Password → Only accessed by admin (red text)
     Role dropdown added
     Role editing enabled
*/

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageURL = URL.createObjectURL(file);
    setPreviewImage(imageURL);

    // TODO: Upload to backend
    // await uploadAvatar(file);
    // toast.success("Profile image updated!");
  };

  const [user, setUser] = useState({
    name: 'Loading...',
    email: '',
    role: '',
    address: '',
    avatar: '',
  });

  const [usersList, setUsersList] = useState([]);

  const [editingUserId, setEditingUserId] = useState(null);
  const [editingRole, setEditingRole] = useState('');

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: '',
  });

  const API_BASE = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetchProfile();
    fetchUsers();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch(`${API_BASE}/api/users/profile`);
      if (!res.ok) throw new Error('Failed to fetch profile');

      const data = await res.json();

      setUser({
        name: data.username || data.name || 'N/A',
        email: data.email || 'N/A',
        role: data.role || 'N/A',
        address: data.address || 'N/A',
        avatar: data.avatar || '',
      });
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch(`${API_BASE}/api/users`);
      if (!res.ok) throw new Error('Failed to fetch users');

      const data = await res.json();

      setUsersList(
        data.map((u) => ({
          id: u._id,
          name: u.username,
          email: u.email || '',
          role: u.role || 'Staff',
          permissions: u.permissions || [],
        }))
      );
    } catch (err) {
      console.error('Users fetch error:', err);
    }
  }

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.password) {
      alert('Please fill all fields.');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      const payload = {
        username: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password: newUser.password,
        permissions: [],
      };

      const res = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create user');

      setNewUser({ name: '', email: '', role: '', password: '', confirmPassword: '' });
      fetchUsers();
      setActiveTab('access');
    } catch (err) {
      console.error('Create user error:', err);
      alert('Failed to create user.');
    }
  };

  const handleTogglePermission = async (userId, perm) => {
    try {
      const userToUpdate = usersList.find((u) => u.id === userId);
      if (!userToUpdate) return;

      const has = userToUpdate.permissions.includes(perm);
      const newPerms = has ? userToUpdate.permissions.filter((p) => p !== perm) : [...userToUpdate.permissions, perm];

      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: newPerms }),
      });

      if (!res.ok) throw new Error('Failed permission update');

      setUsersList((prev) => prev.map((u) => (u.id === userId ? { ...u, permissions: newPerms } : u)));
    } catch (err) {
      console.error('Permission error:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Delete this user?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');

      setUsersList((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error('Delete user error:', err);
    }
  };

  const handleSaveRole = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editingRole }),
      });

      if (!res.ok) throw new Error('Failed to update role');

      setUsersList((prev) => prev.map((u) => (u.id === userId ? { ...u, role: editingRole } : u)));

      setEditingUserId(null);
      setEditingRole('');
    } catch (err) {
      console.error('Role update failed:', err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex gap-6">
        {/* Profile Sidebar */}
        <div className="w-64 space-y-3">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-2 text-sm px-4 py-3 rounded-lg ${activeTab === 'profile' ? 'bg-[#FF9500] text-black' : 'bg-[#2a2a2a]'}`}
          >
            <i className="fa-solid fa-user"></i> My Profile
          </button>

          <button
            onClick={() => setActiveTab('access')}
            className={`w-full flex items-center gap-2 text-sm px-4 py-3 rounded-lg ${activeTab === 'access' ? 'bg-[#FF9500] text-black' : 'bg-[#2a2a2a]'}`}
          >
            <i className="fa-solid fa-gear"></i> Manage Access
          </button>

          <button onClick={() => navigate('/')} className="w-full flex items-center gap-2 text-sm px-4 py-3 rounded-lg bg-[#2a2a2a]">
            <i className="fa-solid fa-right-from-bracket"></i> Logout
          </button>

          {/* ADD NEW USER */}
          <div className="bg-[#1a1a1a] rounded-lg p-4 mt-4">
            <h3 className="text-lg font-semibold mb-3">Add New User</h3>

            <input type="text" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="w-full mb-2 bg-[#2a2a2a] px-3 py-2 rounded-md" />

            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full mb-2 bg-[#2a2a2a] px-3 py-2 rounded-md"
            />

            {/* ROLE DROPDOWN */}
            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full mb-2 bg-[#2a2a2a] px-3 py-2 rounded-md">
              <option value="">Select Role</option>
              <option value="Manager">Manager</option>
              <option value="Assistant Manager">Assistant Manager</option>
              <option value="Cashier">Cashier</option>
              <option value="Waiter">Waiter</option>
              <option value="Head Chef">Head Chef</option>
              <option value="Sous Chef">Sous Chef</option>
              <option value="Cook">Cook</option>
              <option value="Dishwasher">Dishwasher</option>
              <option value="Cleaner">Cleaner</option>
              <option value="Staff">Staff</option>
              <option value="Director">Director</option>
            </select>

            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full mb-2 bg-[#2a2a2a] px-3 py-2 rounded-md"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={newUser.confirmPassword}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full mb-3 bg-[#2a2a2a] px-3 py-2 rounded-md"
            />

            <button onClick={handleAddUser} className="w-full bg-[#FF9500] text-black py-2 rounded-md">
              Add
            </button>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex-1 bg-[#2a2a2a] rounded-2xl p-6">
          {/* MY PROFILE */}
          {activeTab === 'profile' && (
            <>
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>

              {/* Avatar Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  {/* Avatar */}
                  {previewImage ? (
                    <img src={previewImage} className="w-24 h-24 rounded-full border-4 border-[#FF9500]" />
                  ) : user.avatar ? (
                    <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-[#FF9500]" />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-[#FF9500] flex items-center justify-center bg-[#333]">
                      <i className="fa-solid fa-user text-4xl"></i>
                    </div>
                  )}

                  {/* Hidden Upload Input */}
                  <input type="file" accept="image/*" id="profileUpload" className="hidden" onChange={handleImageChange} />

                  {/* Edit Icon Button */}
                  <button onClick={() => document.getElementById('profileUpload').click()} className="absolute bottom-2 right-2 bg-[#FF9500] p-2 rounded-full text-black hover:bg-[#e68a00] transition">
                    <i className="fa-solid fa-pen"></i>
                  </button>
                </div>

                {/* Name + Role */}
                <h3 className="mt-3 text-lg font-medium">{user.name}</h3>
                <p className="text-sm text-[#FF9500]">{user.role}</p>
              </div>

              {/* Information */}
              <div className="space-y-4 bg-[#1a1a1a] p-4 rounded-lg">
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <p className="text-md font-medium">{user.name}</p>
                </div>

                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <p className="text-md font-medium">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm mb-1">Address</label>
                  <p className="text-md font-medium">{user.address}</p>
                </div>

                <div>
                  <label className="block text-sm mb-1">Password</label>
                  <p className="text-md font-medium text-red-400">Only accessed by admin</p>
                </div>
              </div>
            </>
          )}

          {/* MANAGE ACCESS */}
          {activeTab === 'access' && (
            <div className="space-y-6">
              {usersList.map((u) => (
                <div key={u.id} className="p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-semibold">{u.name}</h4>
                      <p className="text-sm text-[#FF9500]">{u.email}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Editable role */}
                      {editingUserId === u.id ? (
                        <>
                          <select value={editingRole} onChange={(e) => setEditingRole(e.target.value)} className="bg-[#333] px-2 py-1 rounded">
                            <option value="Manager">Manager</option>
                            <option value="Assistant Manager">Assistant Manager</option>
                            <option value="Cashier">Cashier</option>
                            <option value="Waiter">Waiter</option>
                            <option value="Head Chef">Head Chef</option>
                            <option value="Sous Chef">Sous Chef</option>
                            <option value="Cook">Cook</option>
                            <option value="Dishwasher">Dishwasher</option>
                            <option value="Cleaner">Cleaner</option>
                            <option value="Staff">Staff</option>
                            <option value="Director">Director</option>
                          </select>

                          <button onClick={() => handleSaveRole(u.id)} className="text-xs bg-green-600 px-2 py-1 rounded">
                            Save
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="bg-[#FF9500] text-black text-xs px-2 py-1 rounded">{u.role}</span>

                          <button
                            onClick={() => {
                              setEditingUserId(u.id);
                              setEditingRole(u.role);
                            }}
                            className="text-xs px-2 py-1 rounded bg-blue-600"
                          >
                            Edit
                          </button>
                        </>
                      )}

                      <button onClick={() => handleDeleteUser(u.id)} className="text-xs px-2 py-1 rounded bg-red-600">
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="flex justify-between items-center mt-4 text-sm">
                    {['Dashboard', 'Reports', 'Inventory', 'Orders', 'Staff', 'Reservations', 'Menu'].map((label) => (
                      <div key={label} className="flex flex-col items-center">
                        <span>{label}</span>

                        <label className="relative inline-flex items-center cursor-pointer mt-1">
                          <input type="checkbox" className="sr-only peer" checked={u.permissions.includes(label)} onChange={() => handleTogglePermission(u.id, label)} />
                          <div className="w-10 h-5 bg-gray-600 rounded-full peer-checked:bg-[#FF9500] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/20 mt-6"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
