import RegionManager from "./_components/RegionManager";
import TagManager from "./_components/TagManager";
import CurrencyManager from "./_components/CurrencyManager";
import Link from "next/link";

const AdminPage = () => {
  return (
    <div className="container mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-semibold">Admin Paneli</h1>

      <RegionManager />
      <TagManager />
      <CurrencyManager />
      <Link 
        href="/protected/admin/villas"
        className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition"
      >
        Villa Yönetimi
      </Link>
    </div>
  );
};

export default AdminPage;
