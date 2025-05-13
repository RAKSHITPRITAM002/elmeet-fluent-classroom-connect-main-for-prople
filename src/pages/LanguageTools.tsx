import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, Globe, BarChart, Search, Copy, MessageSquare } from 'lucide-react';
import { LanguageResource } from '@/types/languageTypes';
import { Link } from 'react-router-dom';

const LanguageTools = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [languages, setLanguages] = useState<LanguageResource[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageResource | null>(null);
  const [newLanguageName, setNewLanguageName] = useState('');
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLanguages();
    }
  }, [user]);

  const fetchLanguages = async () => {
    try {
      const { data, error } = await supabase
        .from('language_resources')
        .select('*');
      
      if (error) throw error;
      
      // Transform the data to match our LanguageResource type
      const typedData = data.map(item => ({
        ...item,
        character_set: Array.isArray((item as any).character_set) ? (item as any).character_set : [],
        common_phrases: Array.isArray((item as any).common_phrases) ? (item as any).common_phrases : [],
        dictionary_entries: Array.isArray((item as any).dictionary_entries) ? (item as any).dictionary_entries : []
      })) as LanguageResource[];
      
      setLanguages(typedData);
      
      if (typedData.length > 0) {
        setSelectedLanguage(typedData[0]);
      }
      
    } catch (error) {
      console.error('Error fetching languages:', error);
      toast({
        title: "Error",
        description: "Failed to load language resources",
        variant: "destructive",
      });
    }
  };

  const handleLanguageSelect = (language: LanguageResource) => {
    setSelectedLanguage(language);
  };

  const handleAddNewLanguage = async () => {
    setIsAddingLanguage(true);
  };

  const handleCreateLanguage = async () => {
    try {
      const { data, error } = await supabase
        .from('language_resources')
        .insert([
          {
            language_name: newLanguageName,
            language_code: newLanguageName.substring(0, 2).toLowerCase(),
            user_id: user?.id,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "New language created successfully",
      });

      setNewLanguageName('');
      setIsAddingLanguage(false);
      fetchLanguages();
    } catch (error) {
      console.error('Error creating language:', error);
      toast({
        title: "Error",
        description: "Failed to create language",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Language Tools</h1>
          <div className="flex gap-2">
            <Button 
              className="bg-[#16849b] hover:bg-[#0d7390] flex items-center gap-2"
              onClick={handleAddNewLanguage}
            >
              <PlusCircle className="h-4 w-4" />
              Add Language
            </Button>
            <Link to="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link to="/meeting">
              <Button variant="outline" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Meeting
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="languages" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="characters">Characters</TabsTrigger>
            <TabsTrigger value="phrases">Common Phrases</TabsTrigger>
            <TabsTrigger value="dictionary">Dictionary</TabsTrigger>
          </TabsList>

          <TabsContent value="languages" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Available Languages</CardTitle>
                <CardDescription>Select a language to view its details</CardDescription>
              </CardHeader>
              <CardContent>
                {languages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {languages.map((language) => (
                      <Button
                        key={language.id}
                        variant={selectedLanguage?.id === language.id ? "default" : "outline"}
                        onClick={() => handleLanguageSelect(language)}
                        className={`flex items-center justify-center h-16 ${selectedLanguage?.id === language.id ? "bg-[#16849b] hover:bg-[#0d7390]" : ""}`}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        {language.language_name}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4">No languages available. Add your first language to get started.</p>
                    <Button 
                      className="bg-[#16849b] hover:bg-[#0d7390] flex items-center gap-2"
                      onClick={handleAddNewLanguage}
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add First Language
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {isAddingLanguage && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Language</CardTitle>
                  <CardDescription>Enter the name of the new language</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="languageName">Language Name</Label>
                    <Input
                      id="languageName"
                      placeholder="Enter language name (e.g., Spanish, Japanese, Arabic)"
                      value={newLanguageName}
                      onChange={(e) => setNewLanguageName(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingLanguage(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-[#16849b] hover:bg-[#0d7390]" 
                      onClick={handleCreateLanguage}
                      disabled={!newLanguageName.trim()}
                    >
                      Create Language
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="characters">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Character Sets</CardTitle>
                  <CardDescription>Special characters for language input</CardDescription>
                </div>
                {selectedLanguage && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Add Characters",
                        description: "This feature will be available in the next update.",
                      });
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Characters
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {selectedLanguage ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-lg font-semibold">
                        {selectedLanguage.language_name} Character Set
                      </h2>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          toast({
                            title: "Copy to Clipboard",
                            description: "All characters copied to clipboard.",
                          });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* Ensure selectedLanguage and character_set are truthy AND character_set is an array */}
                    {selectedLanguage && Array.isArray(selectedLanguage.character_set) && selectedLanguage.character_set.length > 0 ? (
                      <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                        {/* Now TypeScript knows selectedLanguage.character_set is an array here */}
                        {selectedLanguage.character_set.map((character: any, index: number) => ( 
                          // ^^^ TODO: Replace 'any' with the actual type of items in character_set
                          // e.g., if string[] then 'character: string'
                          // if {char: string, name: string}[] then 'character: {char: string, name: string}'
                          <button key={index} /* ... onClick to use character ... */ >
                            {typeof character === 'object' && character !== null && 'char' in character ? (character as any).char : String(character)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No characters available.</p>
                    )}
                      </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Select a language to view its character set.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="phrases">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Common Phrases</CardTitle>
                  <CardDescription>Frequently used expressions</CardDescription>
                </div>
                {selectedLanguage && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Add Phrase",
                        description: "This feature will be available in the next update.",
                      });
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Phrase
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {selectedLanguage ? (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">
                      {selectedLanguage.language_name} Common Phrases
                    </h2>
                    {/* Add Array.isArray check for robust type guarding */}
                    {selectedLanguage && Array.isArray(selectedLanguage.common_phrases) && selectedLanguage.common_phrases.length > 0 ? (
                      <div className="space-y-2">
                        {/* TypeScript now knows selectedLanguage.common_phrases is an array here */}
                        {selectedLanguage.common_phrases.map((phrase: any, index: number) => (
                          // ^^^ TODO: Replace 'any' with the actual type of your phrase objects
                          // e.g., if {id: string, text: string}[] then 'phrase: {id: string, text: string}'
                          <div 
                            key={(typeof phrase === 'object' && phrase !== null && 'id' in phrase ? (phrase as any).id : index)} // Use a stable key
                          >
                            {/* Render your phrase details, e.g., (phrase as any).text */}
                            {typeof phrase === 'object' && phrase !== null && 'text' in phrase ? (phrase as any).text : String(phrase)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No common phrases available.</p>
                    )}
                          </div>
                ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Select a language to view its common phrases.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dictionary">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Dictionary</CardTitle>
                  <CardDescription>Word translations and definitions</CardDescription>
                </div>
                <div className="flex gap-2">
                  {selectedLanguage && (
                    <>
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input 
                          placeholder="Search dictionary..." 
                          className="pl-9 w-[200px]"
                          onChange={() => {
                            toast({
                              title: "Search",
                              description: "Dictionary search will be available in the next update.",
                            });
                          }}
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Add Entry",
                            description: "This feature will be available in the next update.",
                          });
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Entry
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedLanguage ? (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">
                      {selectedLanguage.language_name} Dictionary Entries
                    </h2>
                    {selectedLanguage.dictionary_entries && selectedLanguage.dictionary_entries.length > 0 ? (
                      <div className="space-y-2">
                        {selectedLanguage.dictionary_entries.map((entry: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined, index: React.Key | null | undefined) => (
                          <div 
                            key={index} 
                            className="p-3 border rounded-md hover:bg-gray-50 flex justify-between items-center"
                          >
                            <span>{entry}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                toast({
                                  title: "Entry Copied",
                                  description: `Dictionary entry copied to clipboard.`,
                                });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 mb-4">No dictionary entries defined for this language.</p>
                        <Button 
                          className="bg-[#16849b] hover:bg-[#0d7390]"
                          onClick={() => {
                            toast({
                              title: "Add Dictionary Entry",
                              description: "This feature will be available in the next update.",
                            });
                          }}
                        >
                          Add First Entry
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Select a language to view its dictionary entries.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-center">
          <Link to="/meeting">
            <Button className="bg-[#16849b] hover:bg-[#0d7390] flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Use Language Tools in Meeting
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default LanguageTools;
