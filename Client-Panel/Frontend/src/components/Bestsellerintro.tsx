import Bestseller_cards from "./Product_intro_cards"




const Bestsellerintro = () => {
  return (
    <>
    <div className="flex flex-col items-center justify-center gap-10 w-screen ">
    <div>
      <h1 className="text-5xl  font-semibold text-center textheading bg-clip-text drop-shadow-md">
  Our Bestsellers
</h1>

    </div>
    <div>
      <Bestseller_cards />
    </div>
    
    </div>
    </>
  )
}

export default Bestsellerintro