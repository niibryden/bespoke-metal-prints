import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Star, 
  CheckCircle, 
  X, 
  Loader,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { getServerUrl } from '../../utils/serverUrl';
import { publicAnonKey } from '../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  imageUrl?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TestimonialFormData {
  name: string;
  location: string;
  rating: number;
  text: string;
  imageUrl: string;
  verified: boolean;
}

export function TestimonialManagement({ adminInfo }: { adminInfo?: { email: string; role: string; name: string; permissions: any; accessToken: string } }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<TestimonialFormData>({
    name: '',
    location: '',
    rating: 5,
    text: '',
    imageUrl: '',
    verified: true,
  });

  const serverUrl = getServerUrl();
  const getAuthHeader = () => `Bearer ${adminInfo?.accessToken || publicAnonKey}`;

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`${serverUrl}/admin/testimonials`, {
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTestimonials(data.testimonials || []);
      } else {
        console.error('Failed to fetch testimonials');
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingTestimonial
        ? `${serverUrl}/admin/testimonials/${editingTestimonial.id}`
        : `${serverUrl}/admin/testimonials`;
      
      const method = editingTestimonial ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getAuthHeader(),
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchTestimonials();
        resetForm();
        alert(`Testimonial ${editingTestimonial ? 'updated' : 'created'} successfully!`);
      } else {
        const error = await response.json();
        alert(`Failed to ${editingTestimonial ? 'update' : 'create'} testimonial: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`${serverUrl}/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (response.ok) {
        await fetchTestimonials();
        alert('Testimonial deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to delete testimonial: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      location: testimonial.location,
      rating: testimonial.rating,
      text: testimonial.text,
      imageUrl: testimonial.imageUrl || '',
      verified: testimonial.verified,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      rating: 5,
      text: '',
      imageUrl: '',
      verified: true,
    });
    setEditingTestimonial(null);
    setShowForm(false);
  };

  const seedTestimonials = async () => {
    if (!confirm('This will add 3 sample testimonials from your customers (Eugene N., Jones O., and Martins O.). Continue?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${serverUrl}/admin/testimonials/seed`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message + '\n\n✅ Testimonials added successfully!\n\n💡 Tip: Refresh your homepage to see the new testimonials in the ReviewsCarousel.');
        await fetchTestimonials();
      } else {
        const error = await response.json();
        alert(error.message || error.error || 'Failed to seed testimonials');
      }
    } catch (error) {
      console.error('Error seeding testimonials:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 text-[#ff6b35] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-white [data-theme='light']_&:text-gray-900 flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-[#ff6b35]" />
            Customer Testimonials
          </h2>
          <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mt-1">
            Manage customer reviews and testimonials displayed on your site
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Testimonial
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Total Reviews</p>
              <p className="text-3xl text-white [data-theme='light']_&:text-gray-900 mt-1">{testimonials.length}</p>
            </div>
            <MessageSquare className="w-10 h-10 text-[#ff6b35] opacity-50" />
          </div>
        </div>
        <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Verified Reviews</p>
              <p className="text-3xl text-white [data-theme='light']_&:text-gray-900 mt-1">
                {testimonials.filter(t => t.verified).length}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
          </div>
        </div>
        <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">Average Rating</p>
              <p className="text-3xl text-white [data-theme='light']_&:text-gray-900 mt-1">
                {testimonials.length > 0
                  ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
                  : '0.0'}
              </p>
            </div>
            <Star className="w-10 h-10 text-[#ff6b35] opacity-50" />
          </div>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6">
        {testimonials.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 mb-2">No testimonials yet</h3>
            <p className="text-gray-400 [data-theme='light']_&:text-gray-600 mb-6">
              Add your first customer testimonial to get started, or load sample testimonials
            </p>
            <button
              onClick={seedTestimonials}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Load Sample Testimonials
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-start gap-4">
                  {/* Customer Image */}
                  {testimonial.imageUrl && (
                    <div className="flex-shrink-0">
                      <ImageWithFallback
                        src={testimonial.imageUrl}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg text-white [data-theme='light']_&:text-gray-900 font-medium">
                            {testimonial.name}
                          </h3>
                          {testimonial.verified && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400 [data-theme='light']_&:text-gray-600">
                          {testimonial.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(testimonial)}
                          className="p-2 bg-blue-600/10 text-blue-500 rounded-lg hover:bg-blue-600/20 transition-all"
                          title="Edit testimonial"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(testimonial.id)}
                          disabled={deletingId === testimonial.id}
                          className="p-2 bg-red-600/10 text-red-500 rounded-lg hover:bg-red-600/20 transition-all disabled:opacity-50"
                          title="Delete testimonial"
                        >
                          {deletingId === testimonial.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < testimonial.rating
                              ? 'fill-[#ff6b35] text-[#ff6b35]'
                              : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-300 [data-theme='light']_&:text-gray-700 leading-relaxed mb-3">
                      "{testimonial.text}"
                    </p>

                    {/* Metadata */}
                    <p className="text-xs text-gray-500">
                      Added {new Date(testimonial.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] [data-theme='light']_&:bg-white border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl text-white [data-theme='light']_&:text-gray-900">
                  {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 bg-[#2a2a2a] [data-theme='light']_&:bg-gray-100 text-white [data-theme='light']_&:text-gray-700 rounded-lg hover:bg-[#ff6b35] hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 text-white [data-theme='light']_&:text-gray-900 rounded-lg focus:outline-none focus:border-[#ff6b35]"
                    placeholder="e.g., Eugene N."
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 text-white [data-theme='light']_&:text-gray-900 rounded-lg focus:outline-none focus:border-[#ff6b35]"
                    placeholder="e.g., Glen Burnie, MD"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating })}
                        className="p-2 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            rating <= formData.rating
                              ? 'fill-[#ff6b35] text-[#ff6b35]'
                              : 'text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                    Review Text *
                  </label>
                  <textarea
                    required
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 text-white [data-theme='light']_&:text-gray-900 rounded-lg focus:outline-none focus:border-[#ff6b35]"
                    placeholder="What did the customer say about your product?"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm text-gray-400 [data-theme='light']_&:text-gray-600 mb-2">
                    Customer Photo URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a0a] [data-theme='light']_&:bg-gray-50 border border-[#2a2a2a] [data-theme='light']_&:border-gray-200 text-white [data-theme='light']_&:text-gray-900 rounded-lg focus:outline-none focus:border-[#ff6b35]"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Photo should show customer WITH their metal print (not just a portrait). Search Unsplash for "person with wall art" or "customer with framed print"
                  </p>
                </div>

                {/* Verified */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={formData.verified}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="w-5 h-5 rounded border-[#2a2a2a] [data-theme='light']_&:border-gray-300"
                  />
                  <label htmlFor="verified" className="text-sm text-gray-300 [data-theme='light']_&:text-gray-700">
                    Mark as Verified Purchase
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-[#ff6b35] text-black rounded-lg hover:bg-[#ff8c42] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        {editingTestimonial ? 'Updating...' : 'Adding...'}
                      </span>
                    ) : (
                      <span>{editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-[#2a2a2a] [data-theme='light']_&:bg-gray-200 text-white [data-theme='light']_&:text-gray-700 rounded-lg hover:bg-[#3a3a3a] [data-theme='light']_&:hover:bg-gray-300 transition-all font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}