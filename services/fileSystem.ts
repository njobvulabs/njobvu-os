
import { FileSystemState, FSNode, FileType } from '../types';

export const createInitialFileSystem = (username: string = 'guest'): FileSystemState => {
  const rootId = 'root';
  const homeId = 'home';
  const userId = username; // The user's home folder ID is their username
  const docsId = 'docs';
  const picsId = 'pics';
  const binId = 'bin';
  const readmeId = 'readme';
  const trashId = 'trash';
  const now = Date.now();

  const nodes: Record<string, FSNode> = {
    [rootId]: { id: rootId, parentId: null, name: 'root', type: 'dir', children: [homeId, binId, trashId], createdAt: now, permissions: 'rwxr-xr-x', owner: 'root' },
    [binId]: { id: binId, parentId: rootId, name: 'bin', type: 'dir', children: [], createdAt: now, permissions: 'rwxr-xr-x', owner: 'root' },
    [trashId]: { id: trashId, parentId: rootId, name: '.trash', type: 'dir', children: [], createdAt: now, permissions: 'rwx------', owner: 'root' },
    [homeId]: { id: homeId, parentId: rootId, name: 'home', type: 'dir', children: [userId], createdAt: now, permissions: 'rwxr-xr-x', owner: 'root' },
    [userId]: { id: userId, parentId: homeId, name: username, type: 'dir', children: [docsId, picsId, readmeId], createdAt: now, permissions: 'rwx------', owner: username },
    [docsId]: { id: docsId, parentId: userId, name: 'Documents', type: 'dir', children: [], createdAt: now, permissions: 'rwx------', owner: username },
    [picsId]: { id: picsId, parentId: userId, name: 'Pictures', type: 'dir', children: [], createdAt: now, permissions: 'rwx------', owner: username },
    [readmeId]: { id: readmeId, parentId: userId, name: 'README.txt', type: 'file', content: 'Welcome to Njobvu OS!\n\nThis is a persistent virtual file system.\nYou can create, delete, and edit files.', createdAt: now, permissions: 'rw-r--r--', owner: username },
  };

  return { nodes, rootId, clipboard: null };
};

export const resolvePath = (fs: FileSystemState, path: string): string | null => {
  if (path === '/') return fs.rootId;
  const parts = path.split('/').filter(p => p.length > 0);
  let currentId = fs.rootId;

  for (const part of parts) {
    const currentNode = fs.nodes[currentId];
    if (!currentNode || currentNode.type !== 'dir' || !currentNode.children) return null;
    
    const childId = currentNode.children.find(id => fs.nodes[id].name === part);
    if (!childId) return null;
    currentId = childId;
  }
  return currentId;
};

export const getFullPath = (fs: FileSystemState, nodeId: string): string => {
  let path = '';
  let current = fs.nodes[nodeId];
  if (!current) return '/';
  if (nodeId === 'trash') return '/.trash';
  while (current.parentId) {
    path = `/${current.name}${path}`;
    current = fs.nodes[current.parentId];
  }
  return path || '/';
};

// --- Operations ---

export const copyNode = (fs: FileSystemState, nodeId: string, newParentId: string): FileSystemState => {
  // Simple copy: duplicate the node and its children recursively
  const oldNode = fs.nodes[nodeId];
  if (!oldNode) return fs;

  const newId = Math.random().toString(36).substr(2, 9);
  const newNode: FSNode = { ...oldNode, id: newId, parentId: newParentId, children: oldNode.type === 'dir' ? [] : undefined, createdAt: Date.now() };
  
  // Update parent
  const parent = fs.nodes[newParentId];
  const updatedNodes = { ...fs.nodes, [newId]: newNode, [newParentId]: { ...parent, children: [...(parent.children || []), newId] } };
  
  let newFs = { ...fs, nodes: updatedNodes };

  // Recurse for children
  if (oldNode.children) {
    oldNode.children.forEach(childId => {
      newFs = copyNode(newFs, childId, newId);
    });
  }
  
  return newFs;
};
