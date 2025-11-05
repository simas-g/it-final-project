import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUpload from "@/components/ui/image-upload";
import { Tag as TagIcon, Lock, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/contexts/I18nContext";

const Step1BasicInfo = ({ formData, categories, onInputChange, onImageFileChange, onNext }) => {
  const { toast } = useToast();
  const { t } = useI18n();
  
  return (
  <>
    <Card className="border-2">
      <CardHeader>
        <CardTitle>{t('basicInformation')}</CardTitle>
        <CardDescription>{t('giveInventoryNameDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            {t('nameRequired')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            placeholder={t('myCollection')}
            value={formData.name}
            onChange={onInputChange}
            className="h-11 border-2"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">{t('description')}</Label>
          <textarea
            id="description"
            name="description"
            placeholder={t('describeInventory')}
            value={formData.description}
            onChange={onInputChange}
            className="w-full min-h-[100px] px-3 py-2 border-2 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </CardContent>
    </Card>

    <Card className="border-2">
      <CardHeader>
        <CardTitle>{t('categorization')}</CardTitle>
        <CardDescription>{t('helpOthersFind')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="categoryId" className="text-sm font-medium">{t('category')}</Label>
            <Select
              value={formData.categoryId || undefined}
              onValueChange={(value) => onInputChange({ target: { name: 'categoryId', value } })}
            >
              <SelectTrigger className="h-11 border-2">
                <SelectValue placeholder={t('noCategory')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="tags" className="text-sm font-medium flex items-center">
            <TagIcon className="h-4 w-4 mr-2" />
            {t('tags')}
          </Label>
          <Input
            id="tags"
            name="tags"
            placeholder={t('tagsPlaceholder')}
            value={formData.tags}
            onChange={onInputChange}
            className="h-11 border-2"
          />
          <p className="text-xs text-muted-foreground">{t('separateTagsWithCommas')}</p>
        </div>
      </CardContent>
    </Card>

    <Card className="border-2">
      <CardHeader>
        <CardTitle>{t('mediaAccessibility')}</CardTitle>
        <CardDescription>{t('customizeAppearance')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ImageUpload
          value={formData.imageFile}
          onChange={onImageFileChange}
          onError={(error) => {
            toast({ title: error, variant: 'destructive' });
          }}
        />

        <div className="space-y-4">
          <Label className="text-sm font-medium">{t('accessibility')}</Label>
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
                    {t('public')}
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    {t('private')}
                  </>
                )}
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.isPublic 
                  ? t('anyoneCanEdit')
                  : t('onlySharedCanEdit')
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <div className="flex justify-end">
      <Button type="button" onClick={onNext} size="lg">
        {t('nextCustomId')}
      </Button>
    </div>
  </>
  );
};

export default Step1BasicInfo;

