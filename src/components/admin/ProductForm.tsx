import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Trash2, Globe, Shield, CreditCard, Package, Info, Image as ImageIcon, Search, Key } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { LicenseManager } from "./LicenseManager";


export const ProductForm = ({ product }: { product?: any }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { data: categories } = useQuery({
    queryKey: ['categories-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('id, name');
      if (error) throw error;
      return data;
    }
  });

  const { register, handleSubmit, setValue, watch, control } = useForm({
    defaultValues: product || {
      name: "",
      slug: "",
      sku: "",
      status: "draft",
      currency: "BDT",
      inventory_type: "unlimited",
      product_type: "browser_extensions",
      delivery_method: "license_key",
      price: 0,
      sale_price: null,
      stock_quantity: 0,
      features: [],
      whats_included: [],
      seo_keywords: [],
      resale_auth_verified: false,
      is_featured: false,
      license_duration: 30,
      device_limit: 1,
      compatibility: {
        chrome: true,
        firefox: true,
        edge: true,
        safari: false
      }
    }
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control,
    name: "features"
  });

  const { fields: includedFields, append: appendIncluded, remove: removeIncluded } = useFieldArray({
    control,
    name: "whats_included"
  });

  const inventoryType = watch("inventory_type");
  const productType = watch("product_type");

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Ensure numeric fields are numbers
      const formattedData = {
        ...data,
        price: Number(data.price),
        sale_price: data.sale_price ? Number(data.sale_price) : null,
        stock_quantity: data.stock_quantity ? parseInt(data.stock_quantity) : 0,
        license_duration: data.license_duration ? parseInt(data.license_duration) : null,
        device_limit: data.device_limit ? parseInt(data.device_limit) : null,
        is_featured: !!data.is_featured,
        resale_auth_verified: !!data.resale_auth_verified
      };

      if (product) {
        const { error } = await supabase.from("products").update(formattedData).eq("id", product.id);
        if (error) throw error;
        toast.success("Product updated successfully");
      } else {
        const { error } = await supabase.from("products").insert(formattedData);
        if (error) throw error;
        toast.success("Product created successfully");
      }
      navigate({ to: "/admin/products" });
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-surface-0/95 backdrop-blur py-4 border-b">
        <div className="flex items-center gap-4">
          <Badge variant={watch("status") === 'active' ? 'default' : 'secondary'} className="uppercase">
            {watch("status")}
          </Badge>
          <h2 className="text-xl font-bold truncate max-w-[300px]">{watch("name") || "Untitled Product"}</h2>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" type="button" onClick={() => navigate({ to: "/admin/products" })}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {product ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start p-0 h-12">
          <TabsTrigger value="basic" className="rounded-none h-12 data-[state=active]:border-b-2 data-[state=active]:border-primary px-6">
            <Info className="w-4 h-4 mr-2" /> Basic Info
          </TabsTrigger>
          <TabsTrigger value="pricing" className="rounded-none h-12 data-[state=active]:border-b-2 data-[state=active]:border-primary px-6">
            <CreditCard className="w-4 h-4 mr-2" /> Pricing & Inventory
          </TabsTrigger>
          <TabsTrigger value="fulfillment" className="rounded-none h-12 data-[state=active]:border-b-2 data-[state=active]:border-primary px-6">
            <Package className="w-4 h-4 mr-2" /> Fulfillment
          </TabsTrigger>
          <TabsTrigger value="media" className="rounded-none h-12 data-[state=active]:border-b-2 data-[state=active]:border-primary px-6">
            <ImageIcon className="w-4 h-4 mr-2" /> Media & SEO
          </TabsTrigger>
          {product && inventoryType === 'license' && (
            <TabsTrigger value="inventory-management" className="rounded-none h-12 data-[state=active]:border-b-2 data-[state=active]:border-primary px-6">
              <Key className="w-4 h-4 mr-2" /> License Inventory
            </TabsTrigger>
          )}
        </TabsList>


        <div className="py-6">
          <TabsContent value="basic" className="space-y-6">
            <Card className="border-2 border-transparent bg-surface-1 shadow-sm">

              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Core product identity and classification.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" {...register("name", { required: true })} placeholder="e.g. GPT-4 API Credits" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <div className="flex gap-2">
                      <Input id="slug" {...register("slug", { required: true })} placeholder="gpt4-api-credits" />
                      <Button variant="outline" type="button" size="sm" onClick={() => {
                        const name = watch("name");
                        if (name) setValue("slug", name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
                      }}>Auto</Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select onValueChange={(v) => setValue("category_id", v)} defaultValue={watch("category_id")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Product Type</Label>
                    <Select onValueChange={(v) => setValue("product_type", v)} defaultValue={watch("product_type")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai_tools">AI Tools</SelectItem>
                        <SelectItem value="browser_extensions">Extensions</SelectItem>
                        <SelectItem value="saas_products">SaaS</SelectItem>
                        <SelectItem value="digital_files">Digital Files</SelectItem>
                        <SelectItem value="templates">Templates</SelectItem>
                        <SelectItem value="ai_credits">AI Credits</SelectItem>
                        <SelectItem value="prompts">Prompts</SelectItem>
                        <SelectItem value="automation">Automation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" {...register("sku")} placeholder="CP-GPT4-100" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea id="short_description" {...register("short_description")} placeholder="Brief overview for cards and snippets..." />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="full_description">Full Description</Label>
                  <Textarea id="full_description" {...register("full_description")} className="min-h-[200px]" placeholder="Detailed product information..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Technical Requirements</Label>
                  <Textarea id="requirements" {...register("requirements")} placeholder="System requirements, prerequisites, etc." />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-transparent bg-surface-1 shadow-sm">
              <CardHeader>
                <CardTitle>Features & Benefits</CardTitle>
                <CardDescription>List key highlights that sell the product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Key Features</Label>
                    <Button variant="outline" size="sm" type="button" onClick={() => appendFeature("")}>
                      <Plus className="w-4 h-4 mr-2" /> Add Feature
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    {featureFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <Input {...register(`features.${index}` as const)} placeholder="Enter feature..." />
                        <Button variant="ghost" size="icon" onClick={() => removeFeature(index)} className="shrink-0 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>What's Included</Label>
                    <Button variant="outline" size="sm" type="button" onClick={() => appendIncluded("")}>
                      <Plus className="w-4 h-4 mr-2" /> Add Item
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    {includedFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <Input {...register(`whats_included.${index}` as const)} placeholder="e.g. 24/7 Support" />
                        <Button variant="ghost" size="icon" onClick={() => removeIncluded(index)} className="shrink-0 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {watch("product_type") === 'browser_extensions' && (
              <Card className="border-2 border-transparent bg-surface-1 shadow-sm">
                <CardHeader>
                  <CardTitle>Browser Compatibility</CardTitle>
                  <CardDescription>Specify which browsers this extension supports.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2 p-3 rounded-lg border bg-muted/20">
                    <Switch 
                      id="chrome" 
                      checked={watch("compatibility.chrome")} 
                      onCheckedChange={(v) => setValue("compatibility.chrome", v)} 
                    />
                    <Label htmlFor="chrome" className="cursor-pointer">Chrome</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border bg-muted/20">
                    <Switch 
                      id="firefox" 
                      checked={watch("compatibility.firefox")} 
                      onCheckedChange={(v) => setValue("compatibility.firefox", v)} 
                    />
                    <Label htmlFor="firefox" className="cursor-pointer">Firefox</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border bg-muted/20">
                    <Switch 
                      id="edge" 
                      checked={watch("compatibility.edge")} 
                      onCheckedChange={(v) => setValue("compatibility.edge", v)} 
                    />
                    <Label htmlFor="edge" className="cursor-pointer">Edge</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border bg-muted/20">
                    <Switch 
                      id="safari" 
                      checked={watch("compatibility.safari")} 
                      onCheckedChange={(v) => setValue("compatibility.safari", v)} 
                    />
                    <Label htmlFor="safari" className="cursor-pointer">Safari</Label>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card className="border-2 border-transparent bg-surface-1 shadow-sm">

              <CardHeader>
                <CardTitle>Pricing Strategy</CardTitle>
                <CardDescription>Configure how you charge for this product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Regular Price (BDT)</Label>
                    <Input id="price" type="number" step="0.01" {...register("price")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sale_price">Sale Price (Optional)</Label>
                    <Input id="sale_price" type="number" step="0.01" {...register("sale_price")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Visibility Status</Label>
                    <Select onValueChange={(v) => setValue("status", v as any)} defaultValue={watch("status")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft (Hidden)</SelectItem>
                        <SelectItem value="active">Active (Visible)</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-4 rounded-lg border bg-primary/5">
                  <Switch 
                    id="is_featured" 
                    checked={watch("is_featured")} 
                    onCheckedChange={(v) => setValue("is_featured", v)} 
                  />
                  <div>
                    <Label htmlFor="is_featured" className="cursor-pointer font-bold text-primary">Featured Product</Label>
                    <p className="text-xs text-muted-foreground">Display this product prominently on the homepage and discovery sections.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-transparent bg-surface-1 shadow-sm">

              <CardHeader>
                <CardTitle>Inventory Controls</CardTitle>
                <CardDescription>Manage availability and stock levels.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Inventory Type</Label>
                    <Select onValueChange={(v) => setValue("inventory_type", v as any)} defaultValue={inventoryType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unlimited">Unlimited (Digital Assets)</SelectItem>
                        <SelectItem value="finite">Finite (Physical/Limited)</SelectItem>
                        <SelectItem value="license">License Key Inventory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {inventoryType === 'finite' && (
                    <div className="space-y-2">
                      <Label htmlFor="stock_quantity">Stock Quantity</Label>
                      <Input id="stock_quantity" type="number" {...register("stock_quantity")} />
                    </div>
                  )}
                </div>

                {inventoryType === 'license' && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold">License Key Management</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Keys are managed separately. You can upload keys after creating the product profile.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>License Duration (Days)</Label>
                        <Input type="number" {...register("license_duration")} placeholder="30" />
                        <p className="text-[10px] text-muted-foreground">0 for lifetime, 1 for 24h, 7 for weekly, etc.</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Device Limit</Label>
                        <Input type="number" {...register("device_limit")} placeholder="1" />
                        <p className="text-[10px] text-muted-foreground">Max number of devices per license.</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fulfillment" className="space-y-6">
            <Card className="border-2 border-transparent bg-surface-1 shadow-sm">

              <CardHeader>
                <CardTitle>Delivery Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Delivery Method</Label>
                    <Select onValueChange={(v) => setValue("delivery_method", v as any)} defaultValue={watch("delivery_method")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant_download">Instant Download</SelectItem>
                        <SelectItem value="license_key">License Key Generation</SelectItem>
                        <SelectItem value="email_delivery">Secure Email Delivery</SelectItem>
                        <SelectItem value="manual_fulfillment">Manual Processing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="version">Version / Release</Label>
                    <Input id="version" {...register("version")} placeholder="v1.2.0" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_instructions">Fulfillment Instructions</Label>
                  <Textarea id="delivery_instructions" {...register("delivery_instructions")} placeholder="Shown to customer after purchase..." />
                </div>

                <Separator />

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="resale-verified" 
                    checked={watch("resale_auth_verified")} 
                    onCheckedChange={(v) => setValue("resale_auth_verified", v)} 
                  />
                  <Label htmlFor="resale-verified" className="cursor-pointer">Resale/Distribution Authorization Verified (Internal Only)</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card className="border-2 border-transparent bg-surface-1 shadow-sm">

              <CardHeader>
                <CardTitle>Product Media</CardTitle>
                <CardDescription>Main image and gallery.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image_url">Main Image URL</Label>
                  <Input id="image_url" {...register("image_url")} placeholder="https://..." />
                </div>
                <div className="p-10 border-2 border-dashed rounded-xl text-center">
                  <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm text-muted-foreground">Image upload integration placeholder</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO Optimization</CardTitle>
                <CardDescription>Configure how this product appears in search engines.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <Input id="seo_title" {...register("seo_title")} placeholder="Meta title..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_description">Meta Description</Label>
                  <Textarea id="seo_description" {...register("seo_description")} placeholder="Search engine snippet..." />
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <h4 className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Search Preview
                  </h4>
                  <p className="text-blue-800 text-sm font-medium leading-none mb-1">
                    {watch("seo_title") || watch("name") || "Product Title"} | CloudApper
                  </p>
                  <p className="text-green-800 text-xs mb-1">cloudapper.online/product/{watch("slug")}</p>
                  <p className="text-gray-600 text-xs line-clamp-2">
                    {watch("seo_description") || watch("short_description") || "No description provided."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {product && inventoryType === 'license' && (
            <TabsContent value="inventory-management">
              <LicenseManager productId={product.id} />
            </TabsContent>
          )}

        </div>
      </Tabs>
    </form>
  );
};