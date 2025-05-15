import {
    NavigationMenu, 
    NavigationMenuItem, 
    NavigationMenuList, 
  } from "@/components/ui/navigation-menu" 
import { Background } from "@/components/ui/background";
import Link from 'next/link';
import AuthButtons from "@/components/ui/AuthButton";
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
            <Link href={"/myGroups"}>
            <span className="font-bold text-[#43a047] text-2xl">Splitter Dapp</span>
            </Link>
             
           
          </NavigationMenuItem>
          <NavigationMenuItem>
           
            <AuthButtons />

           
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu> 

       
         
        { children }
      
    </div>
  );
}