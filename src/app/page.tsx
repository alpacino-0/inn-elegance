// Ana sayfanın prerender edilmemesi için
export const dynamic = "force-dynamic"

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Hello World</h1>
    </div>
  );
}
 
export default Home;