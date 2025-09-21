import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { motion } from "framer-motion";
import logo from '@/assets/logob.png'; // Import the logo from assets

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Effect for the advanced, interactive particle constellation background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let mouse = {
      x: 0,
      y: 0,
      radius: (canvas.height / 100) * (canvas.width / 100),
    };

    const handleMouseMoveForCanvas = (event: MouseEvent) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };
    window.addEventListener('mousemove', handleMouseMoveForCanvas);


    let particlesArray: Particle[];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init(); 
    };
    
    class Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      originalSize: number;
      color: string;

      constructor(x: number, y: number, directionX: number, directionY: number, size: number, color: string) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.originalSize = size;
        this.color = color;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = 'rgba(0, 191, 255, 0.7)'; // Deep Sky Blue
        ctx.fill();
      }

      update() {
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
        
        // Mouse collision detection
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius + this.size) {
            if (mouse.x < this.x && this.x < canvas.width - this.size * 10) this.x += 5;
            if (mouse.x > this.x && this.x > this.size * 10) this.x -= 5;
            if (mouse.y < this.y && this.y < canvas.height - this.size * 10) this.y += 5;
            if (mouse.y > this.y && this.y > this.size * 10) this.y -= 5;
            if (this.size < 5) this.size += 1;
        } else if (this.size > this.originalSize) {
            this.size -= 0.1;
        }

        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    const init = () => {
      particlesArray = [];
      let numberOfParticles = (canvas.height * canvas.width) / 8000;
      for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * .4) - .2;
        let directionY = (Math.random() * .4) - .2;
        particlesArray.push(new Particle(x, y, directionX, directionY, size, '#FFF'));
      }
    };
    
    const connect = () => {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            // Connect particles to each other
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                             + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                if (distance < (canvas.width/8) * (canvas.height/8)) {
                    opacityValue = 1 - (distance/20000);
                    ctx.strokeStyle='rgba(0, 191, 255,' + opacityValue + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
             // Connect particles to mouse
            let mouseDistance = ((particlesArray[a].x - mouse.x) * (particlesArray[a].x - mouse.x))
                             + ((particlesArray[a].y - mouse.y) * (particlesArray[a].y - mouse.y));
            if (mouseDistance < (canvas.width/7) * (canvas.height/7)) {
                opacityValue = 1 - (mouseDistance/30000);
                ctx.strokeStyle='rgba(30, 144, 255,' + opacityValue + ')'; // Dodger blue for mouse lines
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
    };

    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMoveForCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Effect for the interactive spotlight background
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
        setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Effect for the 3D tilting card
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      const rotateX = -((y - height / 2) / (height / 2)) * 8;
      const rotateY = ((x - width / 2) / (width / 2)) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };
    const handleMouseLeave = () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    };
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      let role = '';
      switch (email) {
        case 'ngo@example.com': role = 'NGO'; break;
        case 'verifier@example.com': role = 'Verifier'; break;
        case 'admin@example.com': role = 'Admin'; break;
        default:
          toast({
            title: "Login Failed",
            description: "Invalid credentials. Try ngo@example.com, verifier@example.com, or admin@example.com",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
      }
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', email);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${role}!`,
      });
      const dashboardRoute = role === 'NGO' ? '/ngo-dashboard' : 
                             role === 'Verifier' ? '/verifier-dashboard' : 
                             '/admin-dashboard';
      navigate(dashboardRoute);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <AuroraBackground>
       <canvas ref={canvasRef} className="absolute inset-0 z-10" />
       <div
        className="pointer-events-none absolute inset-0 z-20 transition duration-300"
        style={{
            background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`,
        }}
      />
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col items-center justify-center min-h-screen p-4 font-sans z-30"
      >
        <Card 
          ref={cardRef}
          className="w-full max-w-md shadow-2xl bg-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-2xl transition-transform duration-300 ease-out"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <CardHeader className="space-y-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <img src={logo} alt="Company Logo" className="h-20 w-20 rounded-full" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-gray-100 tracking-wider">
                Blue Carbon Registry
              </CardTitle>
              <CardDescription className="text-gray-400 mt-2">
                Environmental Impact Verification Platform
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block pt-4 px-3 w-full text-md text-gray-100 bg-transparent rounded-lg border border-gray-700 appearance-none focus:outline-none focus:ring-0 focus:border-sky-400 peer"
                />
                <Label 
                  htmlFor="email" 
                  className="absolute text-md text-gray-400 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-3 peer-focus:text-sky-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
                >
                  Email
                </Label>
              </div>
              <div className="relative group">
                 <Input
                  id="password"
                  type="password"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block pt-4 px-3 w-full text-md text-gray-100 bg-transparent rounded-lg border border-gray-700 appearance-none focus:outline-none focus:ring-0 focus:border-sky-400 peer"
                />
                <Label 
                  htmlFor="password" 
                  className="absolute text-md text-gray-400 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-3 peer-focus:text-sky-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4"
                >
                  Password
                </Label>
              </div>
              <Button
                type="submit"
                className="w-full bg-white text-black font-bold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="text-sm text-gray-400 space-y-1 text-center">
                <p className="font-medium text-gray-300 mb-2">Demo Credentials:</p>
                <p>ngo@example.com</p>
                <p>verifier@example.com</p>
                <p>admin@example.com</p>
                <p className="text-xs mt-2">Password: any</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AuroraBackground>
  );
};

export default Login;

