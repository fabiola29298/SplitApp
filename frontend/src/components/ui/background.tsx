export const Background = () => {
    return ( 
      <div className="fixed inset-0 z-[-1] overflow-hidden"> 
        <div className="absolute inset-0 bg-gray-900"></div>
   
        
        <div className="absolute left-[10vw] top-[50vh] w-[30vw] h-[30vw] max-w-[618px] max-h-[619px] rounded-full bg-gradient-to-b from-white to-black/0 blur-[200px]"></div>
        <div className="absolute left-[60vw] top-[45vh] w-[35vw] h-[35vw] max-w-[697px] max-h-[697px] rounded-full bg-gradient-to-b from-red-900 to-green-600/0 blur-[200px]"></div>
         
      </div>
    );
  };