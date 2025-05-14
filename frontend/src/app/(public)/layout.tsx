import {
    NavigationMenu, 
    NavigationMenuItem, 
    NavigationMenuList, 
  } from "@/components/ui/navigation-menu"
  import { Button } from "@/components/ui/button";
import { Background } from "@/components/ui/background";

export default function GeneralLayout({
 children
}: {
 children: React.ReactNode;
}) {
  return (
    <div className="relative">
    {/* Background */}
    <Background />
    
    {/* Navigation bar */}
    <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
             <span className="font-bold text-[#43a047] text-2xl">Splitter Dapp</span>
           
          </NavigationMenuItem>
          <NavigationMenuItem>
          <Button className="bg-[#43a047] text-white hover:bg-[#3b8f3f]">
                Select Wallet
            </Button>
           
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu> 

       
         
        { children }
      
    </div>
  );
}