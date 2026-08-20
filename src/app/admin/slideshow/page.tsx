import { createClient } from "@/lib/supabase/server";
import SlideshowManagerClient from "@/app/admin/slideshow/SlideshowManagerClient";

export default async function AdminSlideshowPage() {
  let slides: any[] = [];
  
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("slideshow_slides")
      .select("*")
      .order("display_order", { ascending: true });
      
    if (data) slides = data;
  } catch (err) {
    console.error("Failed to load slides from Supabase:", err);
  }

  return (
    <div className="max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#dddddd]">
        <div>
          <h1 className="text-3xl font-bold text-[#111111] font-heading">Hero Slideshow Manager</h1>
          <p className="text-[#666666] text-sm mt-1">
            Update hero build slides dynamically—change titles, descriptions, images, and YouTube/Instagram links.
          </p>
        </div>
      </div>

      <SlideshowManagerClient initialSlides={slides} />
    </div>
  );
}
