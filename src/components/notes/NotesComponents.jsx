import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Tag,
  Calendar,
  User
} from 'lucide-react';
import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
  fetchNoteById,
  setFilters,
  setPagination,
  clearSelectedNote
} from '../../store/slices/notesSlice';
import { Button, Input, Textarea, Card, Loading, Modal } from '../common';

// Notes List Component
export const NotesList = () => {
  const dispatch = useDispatch();
  const { notes, pagination, filters, isLoading } = useSelector((state) => state.notes);
  const { account } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  const canCreateNote = account?.note_count < account?.limit || account?.limit === -1;

  useEffect(() => {
    dispatch(fetchNotes({ 
      page: pagination.page, 
      limit: pagination.limit,
      search: filters.search,
      tags: filters.tags
    }));
  }, [dispatch, pagination.page, pagination.limit, filters.search, filters.tags]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm, tags: selectedTags }));
    dispatch(setPagination({ page: 1 }));
  };

  const handleDelete = (note) => {
    setNoteToDelete(note);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (noteToDelete) {
      dispatch(deleteNote(noteToDelete.id)).then(() => {
        setDeleteModalOpen(false);
        setNoteToDelete(null);
        // Refresh notes list
        dispatch(fetchNotes({ 
          page: pagination.page, 
          limit: pagination.limit,
          search: filters.search,
          tags: filters.tags
        }));
      });
    }
  };

  const handlePageChange = (newPage) => {
    dispatch(setPagination({ page: newPage }));
  };

  // Get unique tags from all notes for filter dropdown
  const allTags = [...new Set(notes.flatMap(note => note.tags))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-600">
            {pagination.total} notes • {account?.note_count}/{account?.limit === -1 ? '∞' : account?.limit} used
          </p>
        </div>
        <Link to="/notes/create">
          <Button disabled={!canCreateNote}>
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </Link>
      </div>

      {!canCreateNote && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            You've reached your notes limit ({account?.limit}). 
            {account?.plan === 'free' ? ' Upgrade to Pro for unlimited notes.' : ' Contact your admin.'}
          </p>
        </div>
      )}

      {/* Search and Filter */}
      <Card>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search notes by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedTags}
              onChange={(e) => setSelectedTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </Card>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loading size="lg" />
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Card key={note.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 truncate flex-1">
                    {note.title}
                  </h3>
                  <div className="flex items-center space-x-1 ml-2">
                    <Link to={`/notes/${note.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to={`/notes/edit/${note.id}`}>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDelete(note)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-3">
                  {note.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {note.author.name}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No notes found</p>
            <p className="text-sm">Try adjusting your search criteria or create a new note.</p>
            {canCreateNote && (
              <Link to="/notes/create" className="mt-4 inline-block">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Note
                </Button>
              </Link>
            )}
          </div>
        </Card>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center">
          <nav className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            
            {[...Array(pagination.pages)].map((_, index) => (
              <Button
                key={index + 1}
                variant={pagination.page === index + 1 ? 'primary' : 'outline'}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </Button>
            ))}
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
            >
              Next
            </Button>
          </nav>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {/* <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Note"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{noteToDelete?.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal> */}
      <Modal
  isOpen={deleteModalOpen}
  onClose={() => setDeleteModalOpen(false)}
  title="Delete Note"
>
  <p className="text-gray-600">
    Are you sure you want to delete "{noteToDelete?.title}"? This action cannot be undone.
  </p>

  <div className="mt-6 flex justify-end space-x-3">
    <Button
      variant="outline"
      onClick={() => setDeleteModalOpen(false)}
    >
      Cancel
    </Button>
    <Button
      variant="danger"
      onClick={confirmDelete}
    >
      Delete
    </Button>
  </div>
</Modal>

    </div>
  );
};

// Create/Edit Note Form Component
export const NoteForm = ({ isEdit = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedNote, isLoading } = useSelector((state) => state.notes);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: []
  });
  
  const [tagInput, setTagInput] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchNoteById(id));
    }
    
    return () => {
      dispatch(clearSelectedNote());
    };
  }, [dispatch, isEdit, id]);

  useEffect(() => {
    if (isEdit && selectedNote) {
      setFormData({
        title: selectedNote.title,
        description: selectedNote.description,
        tags: selectedNote.tags || []
      });
    }
  }, [isEdit, selectedNote]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const action = isEdit 
        ? updateNote({ id, noteData: formData })
        : createNote(formData);
      
      dispatch(action)
        .unwrap()
        .then(() => {
          navigate('/notes');
        })
        .catch(() => {
          // Error handled by the slice
        });
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Note' : 'Create New Note'}
        </h1>
        <Link to="/notes">
          <Button variant="outline">Back to Notes</Button>
        </Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Title"
            name="title"
            placeholder="Enter note title"
            value={formData.title}
            onChange={handleInputChange}
            error={formErrors.title}
            required
          />

          <Textarea
            label="Description"
            name="description"
            placeholder="Enter note description"
            value={formData.description}
            onChange={handleInputChange}
            error={formErrors.description}
            rows={8}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 mb-0"
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                <Tag className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 text-sm bg-primary-100 text-primary-800 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Link to="/notes">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={isLoading}>
              {isEdit ? 'Update Note' : 'Create Note'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Note Detail View Component
export const NoteDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedNote, isLoading } = useSelector((state) => state.notes);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchNoteById(id));
    }
    
    return () => {
      dispatch(clearSelectedNote());
    };
  }, [dispatch, id]);

  const handleDelete = () => {
    dispatch(deleteNote(id))
      .unwrap()
      .then(() => {
        navigate('/notes');
      })
      .catch(() => {
        // Error handled by the slice
      });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loading size="lg" />
      </div>
    );
  }

  if (!selectedNote) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Note not found</p>
        <Link to="/notes" className="mt-4 inline-block">
          <Button>Back to Notes</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/notes">
          <Button variant="outline">← Back to Notes</Button>
        </Link>
        <div className="flex space-x-2">
          <Link to={`/notes/edit/${selectedNote.id}`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Note Content */}
      <Card>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedNote.title}
            </h1>
            <div className="flex items-center text-sm text-gray-600 space-x-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {selectedNote.author.name}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Created: {new Date(selectedNote.createdAt).toLocaleDateString()}
              </div>
              {selectedNote.updatedAt !== selectedNote.createdAt && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Updated: {new Date(selectedNote.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">
              {selectedNote.description}
            </div>
          </div>

          {selectedNote.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {selectedNote.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-primary-100 text-primary-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Note"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{selectedNote.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    
  );
};