export const mockIssues = [
  {
    id: 1,
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues near the intersection. Multiple vehicles have been damaged.',
    category: 'Road Maintenance',
    status: 'Submitted',
    location: '123 Main St, City',
    imageUrl: 'https://placehold.co/400x300?text=Pothole',
    createdAt: '2024-01-15T10:30:00Z',
    userId: 1,
    userName: 'John Doe',
    department: 'Public Works'
  },
  {
    id: 2,
    title: 'Broken Street Light',
    description: 'Street light not working for 3 days, creating safety hazard at night.',
    category: 'Public Safety',
    status: 'In Progress',
    location: '456 Oak Ave, City',
    imageUrl: 'https://placehold.co/400x300?text=Street+Light',
    createdAt: '2024-01-14T14:20:00Z',
    userId: 2,
    userName: 'Jane Smith',
    department: 'Electrical'
  },
  {
    id: 3,
    title: 'Illegal Dumping',
    description: 'Trash dumped in public park near the playground area.',
    category: 'Sanitation',
    status: 'Resolved',
    location: '789 Park Rd, City',
    imageUrl: 'https://placehold.co/400x300?text=Dumping',
    createdAt: '2024-01-10T09:15:00Z',
    userId: 1,
    userName: 'John Doe',
    department: 'Sanitation'
  },
  {
    id: 4,
    title: 'Damaged Water Pipe',
    description: 'Water leaking from a broken pipe on the sidewalk.',
    category: 'Infrastructure',
    status: 'Submitted',
    location: '22 River Lane, City',
    imageUrl: 'https://placehold.co/400x300?text=Water+Pipe',
    createdAt: '2024-01-16T08:00:00Z',
    userId: 3,
    userName: 'Alice Brown',
    department: 'Unassigned'
  },
  {
    id: 5,
    title: 'Graffiti on Public Wall',
    description: 'Offensive graffiti painted on the community center wall.',
    category: 'Other',
    status: 'In Progress',
    location: '10 Center Blvd, City',
    imageUrl: 'https://placehold.co/400x300?text=Graffiti',
    createdAt: '2024-01-13T11:45:00Z',
    userId: 4,
    userName: 'Bob Wilson',
    department: 'Public Works'
  },
  {
    id: 6,
    title: 'Fallen Tree Blocking Road',
    description: 'A large tree has fallen and is blocking the entire road.',
    category: 'Road Maintenance',
    status: 'Resolved',
    location: '55 Elm Street, City',
    imageUrl: 'https://placehold.co/400x300?text=Fallen+Tree',
    createdAt: '2024-01-09T07:30:00Z',
    userId: 2,
    userName: 'Jane Smith',
    department: 'Public Works'
  },
];

export const mockStats = {
  total: 6,
  pending: 2,
  inProgress: 2,
  resolved: 2
};

export const DEPARTMENTS = ['Unassigned', 'Public Works', 'Electrical', 'Sanitation', 'Water & Sewage', 'Traffic'];
export const CATEGORIES = ['Road Maintenance', 'Public Safety', 'Sanitation', 'Infrastructure', 'Other'];
export const STATUSES = ['Submitted', 'In Progress', 'Resolved', 'Rejected'];
