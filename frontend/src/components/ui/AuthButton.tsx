'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthButtons() {
    const { ready, authenticated, login, logout } = usePrivy();
    const router = useRouter();


    useEffect(() => {
        if (authenticated) {
            router.push('/myGroups');
        }
    }, [authenticated, router]);

    if (!ready) {
        return <Button disabled>Loading...</Button>;
    }

    return (
        <Button onClick={authenticated ? logout : login} className='m-2 bg-[#43a047]'>
            {authenticated ? 'Logout' : 'Login with Privy'}
        </Button>
    );
}
