'use client'

import Link from 'next/link'
import { Button, Card, CardBody, Chip } from '@heroui/react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'
import { useState, useRef } from 'react'
import CreateAccountPing, { SmallPing } from '@/components/CreateAccountPing'
import { FiChevronDown } from 'react-icons/fi'
import { MdOutlineArrowUpward } from 'react-icons/md'
import useMeasure from 'react-use-measure'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Magnet Button Component
const MagnetButton = ({ text, color, href }: { text: string; color: 'primary' | 'secondary'; href: string }) => {
  const ref = useRef<HTMLAnchorElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const xSpring = useSpring(x, {
    mass: 3,
    stiffness: 400,
    damping: 50,
  })
  const ySpring = useSpring(y, {
    mass: 3,
    stiffness: 400,
    damping: 50,
  })

  const transform = useMotionTemplate`translateX(${xSpring}px) translateY(${ySpring}px)`

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return

    const { height, width, left, top } = ref.current.getBoundingClientRect()

    x.set(e.clientX - (left + width / 2))
    y.set(e.clientY - (top + height / 2))
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const borderColor = color === 'primary' ? 'border-primary' : 'border-secondary'
  const textColor = color === 'primary' ? 'text-primary' : 'text-secondary'
  const bgColor = color === 'primary' ? 'bg-primary' : 'bg-secondary'

  return (
    <Link href={href}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transform }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`group relative grid h-[180px] w-[180px] place-content-center rounded-full border-2 ${borderColor} transition-colors duration-700 ease-out cursor-pointer`}
      >
        <MdOutlineArrowUpward className={`pointer-events-none relative z-10 rotate-45 text-6xl ${textColor} transition-all duration-700 ease-out group-hover:rotate-90`} />

        <div className={`pointer-events-none absolute inset-0 z-0 scale-0 rounded-full ${bgColor} transition-transform duration-700 ease-out group-hover:scale-100`} />

        <motion.svg
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
          style={{
            top: "50%",
            left: "50%",
            x: "-50%",
            y: "-50%",
          }}
          width="160"
          height="160"
          className="pointer-events-none absolute z-10"
        >
          <path
            id={`circlePath-${color}`}
            d="M80,80 m-80,0 a80,80 0 1,0 160,0 a80,80 0 1,0 -160,0"
            fill="none"
          />
          <text>
            <textPath
              href={`#circlePath-${color}`}
              className={`fill-${color === 'primary' ? 'primary' : 'secondary'} text-sm font-medium uppercase opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100 group-hover:fill-white`}
              style={{ fill: color === 'primary' ? '#009639' : '#EE161F' }}
            >
              {text} • {text} • {text} • {text} •
            </textPath>
          </text>
        </motion.svg>
      </motion.div>
    </Link>
  )
}

// Client Card Component with hover state
const ClientCard = () => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <motion.div
        animate={{
          y: isHovered ? -8 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card className="h-full rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-primary/20 bg-gradient-to-br from-white to-primary/5">
          <CardBody className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                animate={{
                  scale: isHovered ? 1.1 : 1,
                  rotate: isHovered ? 5 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900">For Clients</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Hire skilled Lebanese professionals for your projects. Save time and money with quality work delivered on time.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Web Development',
                'Graphic Design',
                'Content Writing',
                'Digital Marketing',
                'Video Editing',
                'Translation',
                'Mobile App Development',
                'Social Media Management',
                'Logo Design',
                'SEO Services',
                'Voice Over',
                'Data Entry'
              ].map((service, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gray-100 rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                >
                  {service}
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Magnet Button - appears on hover on desktop, always visible on mobile */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.8,
        }}
        transition={{ duration: 0.3 }}
        className="hidden md:block absolute bottom-4 right-4 pointer-events-none"
        style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
      >
        <MagnetButton text="Post a Project" color="primary" href="/auth/signup" />
      </motion.div>

      {/* Mobile static button */}
      <div className="md:hidden flex justify-center mt-4">
        <Link href="/auth/signup" className="flex items-center gap-2 text-primary font-semibold">
          <span>Post a Project</span>
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </motion.div>
  )
}

// Freelancer Card Component with hover state
const FreelancerCard = () => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <motion.div
        animate={{
          y: isHovered ? -8 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card className="h-full rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-secondary/20 bg-gradient-to-br from-white to-secondary/5">
          <CardBody className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                animate={{
                  scale: isHovered ? 1.1 : 1,
                  rotate: isHovered ? 5 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900">For Freelancers</h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Showcase your skills and get hired for projects you love. Work from home and get paid in USD.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Web Developer',
                'Graphic Designer',
                'Content Writer',
                'Digital Marketer',
                'Video Editor',
                'Translator',
                'App Developer',
                'Social Media Expert',
                'UI/UX Designer',
                'SEO Specialist',
                'Voice Artist',
                'Virtual Assistant'
              ].map((role, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gray-100 rounded-2xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-secondary/10 hover:text-secondary transition-colors cursor-pointer"
                >
                  {role}
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Magnet Button - appears on hover on desktop, always visible on mobile */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.8,
        }}
        transition={{ duration: 0.3 }}
        className="hidden md:block absolute bottom-4 right-4 pointer-events-none"
        style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
      >
        <MagnetButton text="Start Working" color="secondary" href="/auth/signup" />
      </motion.div>

      {/* Mobile static button */}
      <div className="md:hidden flex justify-center mt-4">
        <Link href="/auth/signup" className="flex items-center gap-2 text-secondary font-semibold">
          <span>Start Working</span>
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </motion.div>
  )
}

// Shuffle Testimonials Component
const ShuffleTestimonials = () => {
  const [order, setOrder] = useState(["front", "middle", "back"])

  const handleShuffle = () => {
    const orderCopy = [...order]
    orderCopy.unshift(orderCopy.pop() as string)
    setOrder(orderCopy)
  }

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Graphic Designer",
      text: "Khedme changed my life. I went from struggling to find work to having steady income from home. The payment system is reliable and clients are professional.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
      name: "Ahmed K.",
      role: "Web Developer",
      text: "As a freelancer in Lebanon, getting paid in USD has been crucial. Khedme makes it seamless and secure. I've completed over 50 projects here!",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed"
    },
    {
      name: "Nadia R.",
      role: "Marketing Agency Owner",
      text: "Finding talented Lebanese freelancers has never been easier. The platform is professional, communication is smooth, and payments are secure.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nadia"
    }
  ]

  return (
    <div className="grid place-content-center overflow-visible px-8 py-12">
      <div className="relative -ml-[100px] h-[450px] w-[350px] md:-ml-[175px]">
        <TestimonialCard
          testimonial={testimonials[0]}
          handleShuffle={handleShuffle}
          position={order[0]}
        />
        <TestimonialCard
          testimonial={testimonials[1]}
          handleShuffle={handleShuffle}
          position={order[1]}
        />
        <TestimonialCard
          testimonial={testimonials[2]}
          handleShuffle={handleShuffle}
          position={order[2]}
        />
      </div>
      <p className="text-center text-gray-600 mt-8 text-sm font-medium">
        ← Drag the card to see more testimonials
      </p>
    </div>
  )
}

const TestimonialCard = ({ handleShuffle, testimonial, position }: any) => {
  const mousePosRef = useState(0)[0]
  const [mousePos, setMousePos] = useState(0)

  const onDragStart = (e: any) => {
    setMousePos(e.clientX)
  }

  const onDragEnd = (e: any) => {
    const diff = mousePos - e.clientX

    if (diff > 150) {
      handleShuffle()
    }

    setMousePos(0)
  }

  const x = position === "front" ? "0%" : position === "middle" ? "33%" : "66%"
  const rotateZ = position === "front" ? "-6deg" : position === "middle" ? "0deg" : "6deg"
  const zIndex = position === "front" ? "2" : position === "middle" ? "1" : "0"
  const draggable = position === "front"

  return (
    <motion.div
      style={{
        zIndex,
      }}
      animate={{ rotate: rotateZ, x }}
      drag
      dragElastic={0.35}
      dragListener={draggable}
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      transition={{
        duration: 0.35,
      }}
      className={`absolute left-0 top-0 grid h-[450px] w-[350px] select-none place-content-center space-y-6 rounded-3xl border-2 border-gray-200 bg-white p-6 shadow-2xl ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <img
        src={testimonial.avatar}
        alt={`${testimonial.name}`}
        className="pointer-events-none mx-auto h-32 w-32 rounded-full border-4 border-primary/20 bg-white object-cover shadow-lg"
      />
      <span className="text-center text-lg italic text-gray-700 leading-relaxed">
        "{testimonial.text}"
      </span>
      <div className="text-center">
        <div className="text-base font-bold text-gray-900">{testimonial.name}</div>
        <div className="text-sm text-gray-600">{testimonial.role}</div>
      </div>

      {/* 5 Star Rating */}
      <div className="flex gap-1 justify-center">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </motion.div>
  )
}

// FAQ Question Component
const Question = ({
  title,
  children,
  isOpen,
  onClick
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}) => {
  const [ref, { height }] = useMeasure()

  return (
    <motion.div
      animate={isOpen ? "open" : "closed"}
      className="border-b-[1px] border-b-gray-200"
    >
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between gap-4 py-6"
      >
        <motion.span
          variants={{
            open: {
              color: "rgba(0, 150, 57, 1)",
            },
            closed: {
              color: "rgba(17, 24, 39, 1)",
            },
          }}
          className="text-left text-lg font-semibold"
        >
          {title}
        </motion.span>
        <motion.span
          variants={{
            open: {
              rotate: "180deg",
              color: "rgb(0, 150, 57)",
            },
            closed: {
              rotate: "0deg",
              color: "#030617",
            },
          }}
        >
          <FiChevronDown className="text-2xl" />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? height : "0px",
          marginBottom: isOpen ? "24px" : "0px",
        }}
        className="overflow-hidden text-gray-600"
      >
        <div ref={ref}>{children}</div>
      </motion.div>
    </motion.div>
  )
}

// FAQ Section Component
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqData = [
    {
      title: "How do I get started on Khedme?",
      content: "Simply sign up for free, create your profile, and start browsing projects (for freelancers) or post your first project (for clients). It takes less than 2 minutes to get started!"
    },
    {
      title: "How does payment work?",
      content: "When a client hires you, they fund the project upfront. The money is held securely until you deliver the work and the client approves it. Once approved, you get paid instantly in USD."
    },
    {
      title: "What fees does Khedme charge?",
      content: "We charge a small service fee on each transaction - 10% for freelancers and 3% for clients. This covers payment processing, platform maintenance, and customer support."
    },
    {
      title: "Is my payment secure?",
      content: "Absolutely! We hold all project funds securely from the moment a client hires you. Your payment is guaranteed once you deliver the work and it's approved. We also offer dispute resolution if any issues arise."
    },
    {
      title: "Can I work with international clients?",
      content: "Yes! While Khedme is built for the Lebanese market, clients from anywhere in the world can hire Lebanese freelancers. All payments are processed in USD."
    },
    {
      title: "How long does it take to withdraw money?",
      content: "Withdrawals are processed instantly once a project is approved. You can withdraw to your bank account or preferred payment method within 24-48 hours."
    }
  ]

  return (
    <div>
      {faqData.map((faq, index) => (
        <Question
          key={index}
          title={faq.title}
          isOpen={openIndex === index}
          onClick={() => setOpenIndex(openIndex === index ? null : index)}
        >
          <p>{faq.content}</p>
        </Question>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Fizens Style */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary">
              Khedme
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#how-it-works" className="text-gray-700 hover:text-primary transition">How it Works</Link>
              <Link href="#features" className="text-gray-700 hover:text-primary transition">Features</Link>
              <Link href="#testimonials" className="text-gray-700 hover:text-primary transition">Testimonials</Link>
              <Link href="#faq" className="text-gray-700 hover:text-primary transition">FAQ</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/signin">
                <Button variant="light">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button color="primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Animation */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Chip color="primary" variant="flat" className="mb-6">
                Freelance Platform for Lebanon
              </Chip>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Find Work,<br />Get Paid Instantly
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed"
            >
              Work from home, get paid in USD, and build your future.<br />
              A secure platform connecting clients with skilled professionals in Lebanon.
            </motion.p>

          </motion.div>
        </div>
      </section>

      {/* Smooth Transition */}
      <div className="h-12 bg-gradient-to-b from-white to-gray-50"></div>

      {/* How It Works - With Visual Workflow */}
      <section id="how-it-works" className="py-20 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to start earning
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Send Proposal',
                description: (
                  <>
                    Browse available projects and submit your <strong>proposal</strong> with your <strong>rate</strong> and <strong>timeline</strong>. Show clients why you're the perfect fit.
                  </>
                ),
                illustration: (
                  <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    {/* Background gradient */}
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#E8F5E9', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#C8E6C9', stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#009639', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#00C853', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <rect width="400" height="300" fill="url(#grad1)"/>

                    {/* Document/Paper */}
                    <rect x="80" y="50" width="240" height="200" rx="12" fill="white" stroke="#009639" strokeWidth="3"/>

                    {/* Lines on document */}
                    <line x1="110" y1="90" x2="290" y2="90" stroke="#B2DFDB" strokeWidth="4" strokeLinecap="round"/>
                    <line x1="110" y1="120" x2="270" y2="120" stroke="#B2DFDB" strokeWidth="4" strokeLinecap="round"/>
                    <line x1="110" y1="150" x2="290" y2="150" stroke="#B2DFDB" strokeWidth="4" strokeLinecap="round"/>
                    <line x1="110" y1="180" x2="240" y2="180" stroke="#B2DFDB" strokeWidth="4" strokeLinecap="round"/>

                    {/* Checkmark circle - animated */}
                    <motion.circle
                      cx="200"
                      cy="220"
                      r="30"
                      fill="url(#grad2)"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
                    />
                    <motion.path
                      d="M185 220L195 230L215 210"
                      stroke="white"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    />

                    {/* Floating elements */}
                    <motion.circle
                      cx="60"
                      cy="80"
                      r="8"
                      fill="#009639"
                      opacity="0.3"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <motion.circle
                      cx="340"
                      cy="100"
                      r="6"
                      fill="#009639"
                      opacity="0.3"
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                  </svg>
                ),
                alt: 'Send proposal illustration'
              },
              {
                title: 'Client Accepts',
                description: (
                  <>
                    Clients <strong>review proposals</strong> and select the best freelancer. Once <strong>accepted</strong>, work begins immediately with <strong>clear expectations</strong>.
                  </>
                ),
                illustration: (
                  <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <defs>
                      <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#FFF3E0', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#FFE0B2', stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <rect width="400" height="300" fill="url(#grad3)"/>

                    {/* Two people shaking hands */}
                    {/* Person 1 - Left */}
                    <circle cx="120" cy="120" r="35" fill="url(#grad4)"/>
                    <rect x="85" y="155" width="70" height="90" rx="12" fill="#009639"/>

                    {/* Person 2 - Right */}
                    <circle cx="280" cy="120" r="35" fill="url(#grad4)"/>
                    <rect x="245" y="155" width="70" height="90" rx="12" fill="#009639"/>

                    {/* Handshake in middle */}
                    <motion.path
                      d="M155 180 L175 190 L200 190 L225 180 L245 180"
                      stroke="#f59e0b"
                      strokeWidth="20"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                    />

                    {/* Stars around handshake */}
                    {[
                      { x: 180, y: 150, delay: 0.5 },
                      { x: 220, y: 155, delay: 0.6 },
                      { x: 200, y: 170, delay: 0.7 }
                    ].map((star, i) => (
                      <motion.path
                        key={i}
                        d={`M${star.x},${star.y} L${star.x + 4},${star.y + 8} L${star.x + 12},${star.y + 8} L${star.x + 6},${star.y + 13} L${star.x + 8},${star.y + 21} L${star.x},${star.y + 16} L${star.x - 8},${star.y + 21} L${star.x - 6},${star.y + 13} L${star.x - 12},${star.y + 8} L${star.x - 4},${star.y + 8} Z`}
                        fill="#fbbf24"
                        initial={{ scale: 0, rotate: 0 }}
                        whileInView={{ scale: 1, rotate: 360 }}
                        transition={{ delay: star.delay, duration: 0.5 }}
                      />
                    ))}
                  </svg>
                ),
                alt: 'Client accepts illustration'
              },
              {
                title: 'Get Paid',
                description: (
                  <>
                    <strong>Deliver</strong> your work and get paid <strong>instantly</strong>. Your payment is <strong>secured</strong> from the start and released once the client approves.
                  </>
                ),
                illustration: (
                  <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <defs>
                      <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#E3F2FD', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#BBDEFB', stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#009639', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#00C853', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <rect width="400" height="300" fill="url(#grad5)"/>

                    {/* Large money/wallet */}
                    <rect x="100" y="80" width="200" height="140" rx="16" fill="url(#grad6)"/>

                    {/* Dollar sign */}
                    <text x="200" y="170" textAnchor="middle" fill="white" fontSize="80" fontWeight="bold">$</text>

                    {/* Coins flying */}
                    {[
                      { x: 80, y: 60, delay: 0.2 },
                      { x: 320, y: 70, delay: 0.3 },
                      { x: 60, y: 200, delay: 0.4 },
                      { x: 340, y: 190, delay: 0.5 }
                    ].map((coin, i) => (
                      <motion.g
                        key={i}
                        initial={{ y: 100, opacity: 0, scale: 0 }}
                        whileInView={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{ delay: coin.delay, duration: 0.6, type: "spring" }}
                      >
                        <circle cx={coin.x} cy={coin.y} r="20" fill="#fbbf24"/>
                        <text x={coin.x} y={coin.y + 8} textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">$</text>
                      </motion.g>
                    ))}

                    {/* Success checkmark */}
                    <motion.circle
                      cx="200"
                      cy="240"
                      r="25"
                      fill="#00C853"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 0.7, duration: 0.5, type: "spring" }}
                    />
                    <motion.path
                      d="M188 240L198 250L212 236"
                      stroke="white"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      transition={{ delay: 0.9, duration: 0.4 }}
                    />

                    {/* Sparkles */}
                    {[
                      { x: 140, y: 50 },
                      { x: 260, y: 55 },
                      { x: 150, y: 240 },
                      { x: 250, y: 235 }
                    ].map((sparkle, i) => (
                      <motion.g
                        key={i}
                        initial={{ scale: 0, rotate: 0 }}
                        whileInView={{ scale: 1, rotate: 180 }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                      >
                        <path
                          d={`M${sparkle.x},${sparkle.y - 8} L${sparkle.x},${sparkle.y + 8} M${sparkle.x - 8},${sparkle.y} L${sparkle.x + 8},${sparkle.y}`}
                          stroke="#fbbf24"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </motion.g>
                    ))}
                  </svg>
                ),
                alt: 'Get paid illustration'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 overflow-hidden group rounded-3xl shadow-lg">
                  <CardBody className="p-0">
                    <div className="relative h-64 overflow-hidden mt-8 mx-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white">
                      <motion.div
                        className="w-full h-full rounded-2xl overflow-hidden"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="w-full h-full rounded-2xl overflow-hidden">
                          {item.illustration}
                        </div>
                      </motion.div>
                    </div>
                    <div className="p-8 pt-6">
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Smooth Transition */}
      <div className="h-12 bg-gradient-to-b from-gray-50 to-white"></div>

      {/* What Can You Work As / What Can You Hire For Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Find Talent or Find Work
            </h2>
            <p className="text-xl text-gray-600">
              Whatever you need, we've got you covered
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Clients */}
            <ClientCard />

            {/* For Freelancers */}
            <FreelancerCard />
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              All the tools and features to help you find work, manage projects, and get paid securely
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                title: 'Secure Payments',
                description: 'Your payment is held safely until work is delivered and approved. Full protection for both parties.',
                color: 'text-green-600'
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Instant Payouts',
                description: 'Get paid in USD immediately after project approval. No waiting, no hassle.',
                color: 'text-yellow-600'
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
                title: 'Direct Messaging',
                description: 'Communicate directly with clients or freelancers. Share files and discuss project details.',
                color: 'text-blue-600'
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ),
                title: 'Verified Reviews',
                description: 'Real reviews from completed projects. Build your reputation with every delivery.',
                color: 'text-purple-600'
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Dispute Protection',
                description: 'Fair resolution process if issues arise. Our team ensures both parties are treated fairly.',
                color: 'text-red-600'
              },
              {
                icon: (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Low Fees',
                description: 'Keep more of what you earn. Competitive rates designed for the Lebanese market.',
                color: 'text-indigo-600'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 rounded-3xl shadow-lg">
                  <CardBody className="p-8 text-center">
                    <div className={`mb-4 inline-block ${feature.color}`}>{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Smooth Transition to Testimonials */}
      <div className="h-20 bg-gradient-to-b from-white to-gray-50"></div>

      {/* Testimonials - Shuffling Cards */}
      <section id="testimonials" className="py-20 bg-gray-50 px-4 relative overflow-hidden">
        {/* Subtle animated background elements */}
        <motion.div
          className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/5 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied freelancers and clients
            </p>
          </motion.div>

          <ShuffleTestimonials />
        </div>
      </section>

      {/* Smooth Transition from Testimonials to FAQ */}
      <div className="h-20 bg-gradient-to-b from-gray-50 to-white"></div>

      {/* FAQ - Fizens Style */}
      <section id="faq" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about Khedme
            </p>
          </motion.div>

          <FAQSection />
        </div>
      </section>

      {/* Smooth Transition to CTA */}
      <div className="h-20 bg-gradient-to-b from-white to-gray-50"></div>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-primary/5 px-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
              Join thousands of Lebanese professionals building their future on Khedme
            </p>
            <Link href="/auth/signup">
              <Button
                size="lg"
                color="primary"
                className="font-bold text-base px-12 py-7 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center"
              >
                <SmallPing />
                Create Your Free Account
              </Button>
            </Link>
            <p className="text-sm mt-6 text-gray-500">
              No credit card required • Get started in under 2 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-white text-2xl font-bold mb-4">Khedme</div>
              <p className="text-sm">
                Freelance platform for Lebanese and Arab professionals.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">For Freelancers</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/projects" className="hover:text-white transition">Browse Projects</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white transition">How It Works</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">For Clients</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/freelancers" className="hover:text-white transition">Find Freelancers</Link></li>
                <li><Link href="/post-project" className="hover:text-white transition">Post a Project</Link></li>
                <li><Link href="/success-stories" className="hover:text-white transition">Success Stories</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition">Terms</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 Khedme. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// What's Missing on this Page:
// 1. Real user statistics from database
// 2. More testimonials from verified users
// 3. Video testimonials or case studies
// 4. Live project showcase carousel
// 5. Payment method logos (OMT, Whish Money, Bank transfer)
// 6. Multi-language support toggle
// 7. SEO optimization tags
// 8. Analytics tracking integration
// 9. Newsletter signup form
// 10. Live chat support widget
