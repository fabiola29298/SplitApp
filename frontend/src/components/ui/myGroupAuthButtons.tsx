'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button'; 
import { useRouter } from 'next/navigation';

export default function MyGroupAuthButtons() {
    const { ready, authenticated, login } = usePrivy();
    const router = useRouter();

    const handleMyGroupPage = async () => { 
        router.push('/myGroups');
    };


    if (!ready) {
        return <Button disabled>Loading...</Button>;
    }

    return (
        <Button onClick={authenticated ? handleMyGroupPage : login} className='m-2 bg-[#43a047]'>
            {authenticated ? 'Start' : 'Login with Privy'}
        </Button>
    );
}
