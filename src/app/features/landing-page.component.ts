import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
    selector: 'app-landing-page',
    standalone:true,
    imports: [RouterLink],
    template:`
    <section class="hero">
        <div class="hero-bg">
            <div class="blob b1"></div>
            <div class="blob b2"></div>
            <div class="blob b3"></div>
        </div>

        <div class="hero-inner">
            <h1 class= "brand">
                <span class="logo">Shop<span>Smart.</span></span>
            </h1>

            <p class= "tagline">Find the right tech.</p>

            <div class="cta">
                <a routerLink="/products" class="btn-primary">Shop now</a>
                <a routerLink="/history" class="btn secondary">Order history</a>
            </div>
        </div>
    </section>
    
<section class="features cintainer">
    <div class="f">
        <h3>Fast search</h3>
        <p>Filter by name, price and category in real-time</p>
    </div>
    <div class= "f">
        <h3>Secure checkout</h3>
        <p>Heart your products and come back later.</p>
    </div>
</section>
    `,
    styles: [ ` 
       .hero{
    position:relative; overflow:hidden; isolation:isolate;
    padding: 6rem 1rem 4rem;
    border-radius: 0 0 18px 18px;
    background: linear-gradient(180deg,#3b82f6 0%, #6ea8ff 100%);
    color:#fff;
  }
  .hero-bg { position:absolute; inset:0; pointer-events:none; }
  .blob{
    position:absolute; width:520px; height:520px; filter: blur(60px); opacity:.4;
    transform: translate(-50%,-50%); border-radius:50%;
    background: radial-gradient(circle at 30% 30%, #ffffff, rgba(255,255,255,0));
    animation: float 14s ease-in-out infinite;
  }
  .b1{ top:15%; left:20%; }
  .b2{ top:40%; left:80%; animation-delay:-4s; }
  .b3{ top:85%; left:50%; animation-delay:-8s; }
  @keyframes float {
    0%,100% { transform: translate(-50%,-50%) scale(1); }
    50%     { transform: translate(-48%,-52%) scale(1.08); }
  }

  .hero-inner{ max-width:1000px; margin:0 auto; text-align:center; position:relative; z-index:1; }
  .brand{ font-size: clamp(2.2rem, 4vw, 3.2rem); margin:0 0 .5rem; letter-spacing:.5px; }
  .logo span{ font-weight:800; }
  .tagline{ opacity:.95; font-size:1.1rem; margin-bottom:1.25rem; }

  .cta{ display:inline-flex; gap:.6rem; }
  .btn-primary{
    background:#fff; color:#1d4ed8; padding:.65rem 1rem; border-radius:.8rem;
    font-weight:700; text-decoration:none; box-shadow:0 6px 18px rgba(0,0,0,.12);
  }
  .btn-primary:hover{ filter:brightness(0.97); }
  .btn-secondary{
    background:rgba(255,255,255,.18); color:#fff; padding:.65rem 1rem; border-radius:.8rem;
    text-decoration:none; border:1px solid rgba(255,255,255,.35);
  }
  .btn-secondary:hover{ background:rgba(255,255,255,.26); }

  .container{ max-width:1100px; margin: 1.5rem auto; padding: 0 1rem; }
  .features{ display:grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap:1rem; }
  .f{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:1rem;
      box-shadow:0 8px 24px rgba(0,0,0,.04); }
  .f h3{ margin:0 0 .25rem; }
  .f p{ opacity:.85; }
  `]
})

export class LandingPageComponent{}
        
     