import Bestseller_cards from "./Product_intro_cards"




const Bestsellerintro = () => {
  return (
    <>
    <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10 w-screen px-3 sm:px-4">
    <div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-center textheading bg-clip-text drop-shadow-md">
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