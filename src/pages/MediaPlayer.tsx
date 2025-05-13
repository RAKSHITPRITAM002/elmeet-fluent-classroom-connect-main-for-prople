import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { MediaResource } from '@/types/languageTypes';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { PlusCircle, Video, BarChart, Upload, X, Play } from 'lucide-react';

const MediaPlayer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mediaItems, setMediaItems] = useState<MediaResource[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaResource | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newMedia, setNewMedia] = useState({
    title: '',
    url: '',
    type: 'audio' as "audio" | "video" | "image" | "document",
    description: '',
  });

  useEffect(() => {
    if (user) {
      fetchMedia();
    }
  }, [user]);

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media_resources')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      // Convert the types to match our MediaResource interface
      const typedData = data.map(item => ({
        ...item,
        type: item.type as "audio" | "video" | "image" | "document"
      })) as MediaResource[];
      
      setMediaItems(typedData);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast({
        title: "Error",
        description: "Failed to load media resources",
        variant: "destructive",
      });
    }
  };

  const handleMediaSelect = (media: MediaResource) => {
    setSelectedMedia(media);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewMedia({
      ...newMedia,
      [e.target.name]: e.target.value,
    });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewMedia({
      ...newMedia,
      type: e.target.value as "audio" | "video" | "image" | "document",
    });
  };

  const handleMediaUpload = async () => {
    if (!user) return;

    setUploading(true);
    try {
      const { data, error } = await supabase
        .from('media_resources')
        .insert([
          {
            ...newMedia,
            user_id: user.id,
          },
        ]);

      if (error) throw error;

      fetchMedia();
      setNewMedia({
        title: '',
        url: '',
        type: 'audio',
        description: '',
      });
      toast({
        title: "Media Uploaded",
        description: "New media item has been uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: "Error",
        description: "Failed to upload media resource",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Media Player</h1>
          <div className="flex gap-2">
            <Button 
              variant={selectedMedia ? "outline" : "default"}
              className={!selectedMedia ? "bg-[#16849b] hover:bg-[#0d7390]" : ""}
              onClick={() => setSelectedMedia(null)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload New
            </Button>
            <Link to="/dashboard">
              <Button variant="outline">
                <BarChart className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {mediaItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Media List */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h2 className="text-lg font-semibold mb-4">Media Library</h2>
                {mediaItems.length > 0 ? (
                  <ul className="space-y-2">
                    {mediaItems.map((media) => (
                      <li
                        key={media.id}
                        className={`py-2 px-4 border rounded-md cursor-pointer hover:bg-gray-100 transition-colors ${
                          selectedMedia?.id === media.id ? 'bg-[#16849b] text-white' : 'bg-white'
                        }`}
                        onClick={() => handleMediaSelect(media)}
                      >
                        <div className="flex items-center">
                          {media.type === 'audio' && <Play className="h-4 w-4 mr-2" />}
                          {media.type === 'video' && <Video className="h-4 w-4 mr-2" />}
                          <span className="truncate">{media.title}</span>
                        </div>
                        <div className="text-xs mt-1 opacity-80">
                          {media.type.charAt(0).toUpperCase() + media.type.slice(1)}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">No media items found</p>
                )}
              </div>
            </div>

            {/* Media Player or Upload Form */}
            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                {selectedMedia ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Now Playing: {selectedMedia.title}</h2>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedMedia(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="bg-gray-900 rounded-lg overflow-hidden mb-4">
                      {selectedMedia.type === 'audio' && (
                        <div className="p-8 flex justify-center items-center bg-gray-800">
                          <audio controls className="w-full">
                            <source src={selectedMedia.url} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      )}
                      {selectedMedia.type === 'video' && (
                        <video controls className="w-full aspect-video">
                          <source src={selectedMedia.url} type="video/mp4" />
                          Your browser does not support the video element.
                        </video>
                      )}
                      {selectedMedia.type === 'image' && (
                        <img src={selectedMedia.url} alt={selectedMedia.title} className="w-full" />
                      )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-medium mb-2">Description</h3>
                      <p className="text-gray-700">{selectedMedia.description || "No description provided."}</p>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Share Media",
                            description: "This feature will be available in the next update.",
                          });
                        }}
                      >
                        Share
                      </Button>
                      <Button 
                        className="bg-[#16849b] hover:bg-[#0d7390]" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Use in Meeting",
                            description: "This media will be available in your next meeting.",
                          });
                        }}
                      >
                        Use in Meeting
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Upload New Media</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                          Title
                        </label>
                        <input
                          className="border rounded-md w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#16849b]"
                          id="title"
                          name="title"
                          type="text"
                          placeholder="Media Title"
                          value={newMedia.title}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="url">
                          URL
                        </label>
                        <input
                          className="border rounded-md w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#16849b]"
                          id="url"
                          name="url"
                          type="text"
                          placeholder="Media URL"
                          value={newMedia.url}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                          Type
                        </label>
                        <select
                          className="border rounded-md w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#16849b]"
                          id="type"
                          name="type"
                          value={newMedia.type}
                          onChange={handleTypeChange}
                        >
                          <option value="audio">Audio</option>
                          <option value="video">Video</option>
                          <option value="image">Image</option>
                          <option value="document">Document</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                          Description
                        </label>
                        <textarea
                          className="border rounded-md w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#16849b]"
                          id="description"
                          name="description"
                          rows={4}
                          placeholder="Media Description"
                          value={newMedia.description}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          className="bg-[#16849b] hover:bg-[#0d7390] flex items-center gap-2"
                          onClick={handleMediaUpload}
                          disabled={uploading}
                        >
                          <Upload className="h-4 w-4" />
                          {uploading ? 'Uploading...' : 'Upload Media'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Media Resources Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Upload audio and video resources to share with your students during language lessons.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-[#16849b] hover:bg-[#0d7390] flex items-center gap-2"
                onClick={() => setSelectedMedia(null)}
              >
                <Upload className="h-4 w-4" />
                Upload Your First Media
              </Button>
              <Link to="/dashboard">
                <Button variant="outline" className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MediaPlayer;
