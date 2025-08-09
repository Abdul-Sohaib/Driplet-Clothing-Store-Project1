/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const SiteSettings = () => {
  const [logo, setLogo] = useState<File | null>(null);
  const [section1Banners, setSection1Banners] = useState<File[]>([]);
  const [section2Banners, setSection2Banners] = useState<File[]>([]);
  const [section3Banners, setSection3Banners] = useState<File[]>([]);
  const [tagline, setTagline] = useState("");
  const [about, setAbout] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>({
    logo: "",
    banners: {
      section1: [],
      section2: [],
      section3: [],
    },
  });

  const { getToken } = useAuth();

  // Fetch site settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE}/site-settings`);
        const data = res.data;
        setTagline(data.tagline || "");
        setAbout(data.about || "");
        setPreview({
          logo: data.logoUrl || "",
          banners: {
            section1: data.banners?.section1 || [],
            section2: data.banners?.section2 || [],
            section3: data.banners?.section3 || [],
          },
        });
      } catch (err) {
        console.error("Error fetching site settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        alert("Admin token not found. Please login.");
        return;
      }

      const formData = new FormData();
      if (logo) formData.append("logo", logo);
      section1Banners.forEach((file) => formData.append("section1", file));
      section2Banners.forEach((file) => formData.append("section2", file));
      section3Banners.forEach((file) => formData.append("section3", file));
      formData.append("tagline", tagline);
      formData.append("about", about);

      await axios.post(`${API_BASE}/site-settings/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Site settings updated successfully!");
    } catch (err) {
      console.error("Error updating site settings:", err);
      alert("Failed to update site settings.");
    } finally {
      setLoading(false);
    }
  };

  const renderBannerInput = (
    section: "section1" | "section2" | "section3",
    label: string
  ) => {
    const setter =
      section === "section1"
        ? setSection1Banners
        : section === "section2"
        ? setSection2Banners
        : setSection3Banners;

    return (
      
      <div>
        
        <label className="block font-medium mb-1">{label}</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setter(Array.from(e.target.files || []))}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {preview.banners[section]?.map((url: string, idx: number) => (
            <img
              key={idx}
              src={url}
              alt={`${label} ${idx + 1}`}
              className="w-24 h-16 object-cover border rounded"
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded shadow w-screen flex flex-col justify-center gap-20 mx-auto">
      <div className="flex justify-between items-center gap-20 px-12">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all duration-300 cursor-pointer"
          disabled={loading}
        >
          Back to Home
        </button>
        <h1 className="text-3xl font-bold text-black">Site Settings</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 px-12">
        {/* Logo */}
        <div>
          <label className="block font-medium mb-1">Website Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files?.[0] || null)}
          />
          {preview.logo && (
            <img
              src={preview.logo}
              alt="Current Logo"
              className="w-24 h-24 mt-2 object-contain border rounded"
            />
          )}
        </div>

        {/* Banner Sections */}
        {renderBannerInput("section1", "Banner Section 1")}
        {renderBannerInput("section2", "Banner Section 2")}
        {renderBannerInput("section3", "Banner Section 3")}

        {/* Tagline */}
        <div>
          <label className="block font-medium mb-1">Tagline</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </div>

        {/* About */}
        <div>
          <label className="block font-medium mb-1">About / Description</label>
          <textarea
            className="w-full h-24 border px-3 py-2 rounded"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
};

export default SiteSettings;
