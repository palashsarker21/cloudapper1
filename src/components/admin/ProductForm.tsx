import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export const ProductForm = ({ product }: { product?: any }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: product || {
      name: "",
      slug: "",
      sku: "",
      status: "draft",
      currency: "BDT",
      inventory_type: "unlimited"
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      if (product) {
        await supabase.from("products").update(data).eq("id", product.id);
      } else {
        await supabase.from("products").insert(data);
      }
      navigate({ to: "/admin/products" });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start p-0">
          <TabsTrigger value="basic" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Pricing</TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 py-4">
          <div className="grid gap-4">
            <div>
              <Label>Product Name</Label>
              <Input {...register("name", { required: true })} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input {...register("slug", { required: true })} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4 py-4">
          <div className="grid gap-4">
            <div>
              <Label>Price (BDT)</Label>
              <Input type="number" {...register("price")} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4 py-4">
          <div className="grid gap-4">
            <div>
              <Label>Inventory Type</Label>
              <Select onValueChange={(v) => setValue("inventory_type", v)} defaultValue={watch("inventory_type")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                  <SelectItem value="finite">Finite</SelectItem>
                  <SelectItem value="license">License</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {product ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
};