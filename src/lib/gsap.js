/* Register GSAP plugins once. SplitText is free since GSAP 3.13. */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true });
gsap.defaults({ ease: 'power4.out' });

export { gsap, ScrollTrigger, SplitText, useGSAP };
