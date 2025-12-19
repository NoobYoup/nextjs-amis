import Hero from '@/components/home/Hero';
import Stats from '@/components/home/Stats';
import Features from '@/components/home/Features';
import Tuition from '@/components/home/Tuition';
import ContactInfo from '@/components/home/ContactInfo';
import Partners from '@/components/home/Partners';

export default function Home() {
    return (
        <>
            <Hero />
            <Stats />
            <Features />
            <Tuition />
            <ContactInfo />
            <Partners />
        </>
    );
}
