import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Image as ImageIcon, Tag as TagIcon, Lock, Globe } from "lucide-react";

const Step1BasicInfo = ({ formData, categories, onInputChange, onNext }) => (
  <>
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Give your inventory a name and description</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="My Collection"
            value={formData.name}
            onChange={onInputChange}
            className="h-11 border-2"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">Description</Label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe your inventory..."
            value={formData.description}
            onChange={onInputChange}
            className="w-full min-h-[100px] px-3 py-2 border-2 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </CardContent>
    </Card>

    <Card className="border-2">
      <CardHeader>
        <CardTitle>Categorization</CardTitle>
        <CardDescription>Help others find your inventory</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="categoryId" className="text-sm font-medium">Category</Label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={onInputChange}
              className="w-full h-11 px-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">No category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="tags" className="text-sm font-medium flex items-center">
            <TagIcon className="h-4 w-4 mr-2" />
            Tags
          </Label>
          <Input
            id="tags"
            name="tags"
            placeholder="vintage, rare, collectible (comma separated)"
            value={formData.tags}
            onChange={onInputChange}
            className="h-11 border-2"
          />
          <p className="text-xs text-muted-foreground">Separate tags with commas</p>
        </div>
      </CardContent>
    </Card>

    <Card className="border-2">
      <CardHeader>
        <CardTitle>Media & Visibility</CardTitle>
        <CardDescription>Customize how your inventory appears</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="text-sm font-medium flex items-center">
            <ImageIcon className="h-4 w-4 mr-2" />
            Image URL
          </Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={formData.imageUrl}
            onChange={onInputChange}
            className="h-11 border-2"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium">Visibility</Label>
          <div className="flex items-center space-x-4 p-4 border-2 rounded-lg">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onChange={onInputChange}
              className="w-4 h-4 rounded border-2"
            />
            <div className="flex-1">
              <label htmlFor="isPublic" className="font-medium cursor-pointer flex items-center">
                {formData.isPublic ? (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Private
                  </>
                )}
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.isPublic 
                  ? "Anyone can view this inventory"
                  : "Only you and people you share with can view this inventory"
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <div className="flex justify-end">
      <Button type="button" onClick={onNext} size="lg">
        Next: Custom ID Configuration
      </Button>
    </div>
  </>
);

export default Step1BasicInfo;

