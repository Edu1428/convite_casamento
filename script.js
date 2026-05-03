document.addEventListener('DOMContentLoaded', () => {

    /* =======================================================
       1. CONTROLE DA ABERTURA MARVEL
       ======================================================= */
    
    const introMusic = document.getElementById('introMusic');
    const marvelIntroContainer = document.getElementById('marvelIntro');
    const marvelBackground = document.getElementById('marvelBackground');
    const marvelText = document.getElementById('marvelText');
    const flashEffect = document.getElementById('flashEffect');
    const mainContent = document.getElementById('mainContent');
    const body = document.body;

    const mediaUrls = [
        'assets/foto_abertura_1.jpg', // Nova foto no começo
        'assets/video_abertura_1.mp4', // Vídeo movido para segundo
        'assets/video_casal.mp4',
        'assets/foto_abertura_1.jpg', // (Usando imagem existente no lugar de casal.jpg que estava faltando)
        'assets/foto_aliancas.jpg' // O usuário deve substituir este arquivo com a foto em anexo
    ];

    marvelBackground.innerHTML = ''; // Limpar antes de adicionar
    marvelBackground.className = 'video-container single-mode'; // Nova classe

    const mediaElements = [];

    // Tentar tocar a Música logo no carregamento (Pode ser bloqueado sem interação)
    if(introMusic) {
        introMusic.volume = 1.0;
        introMusic.play().catch(e => {
            console.log('Áudio bloqueado sem interação prévia', e);
            const soundBtn = document.getElementById('soundButton');
            if(soundBtn) {
                soundBtn.classList.remove('hidden');
                soundBtn.addEventListener('click', () => {
                    introMusic.play();
                    soundBtn.classList.add('hidden');
                });
            }
        });
    }
    
    // Criar as mídias (todas ocultas por padrão, empilhadas)
    mediaUrls.forEach((url, index) => {
        const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
        const media = document.createElement(isVideo ? 'video' : 'img');
        
        media.src = url;
        media.className = 'single-media';
        
        // A primeira mídia começa visível
        if (index === 0) media.classList.add('active');
        
        marvelBackground.appendChild(media);
        mediaElements.push(media);

        if (isVideo) {
            media.autoplay = true;
            media.muted = true;
            media.loop = true;
            media.playsInline = true;
            // O play deve ser chamado depois de anexado ao DOM para evitar erros no iOS/Safari
            let playPromise = media.play();
            if(playPromise !== undefined) {
                playPromise.catch(e => console.log('Autoplay de video bloqueado', e));
            }
        }
    });

    // Trocar a mídia a cada 1.1 segundos
    let currentIndex = 0;
    const slideshowInterval = setInterval(() => {
        if (currentIndex < mediaElements.length - 1) {
            mediaElements[currentIndex].classList.remove('active');
            if(mediaElements[currentIndex].tagName === 'VIDEO') {
                mediaElements[currentIndex].pause();
            }
            
            currentIndex++;
            mediaElements[currentIndex].classList.add('active');
            if(mediaElements[currentIndex].tagName === 'VIDEO') {
                let p = mediaElements[currentIndex].play();
                if(p !== undefined) {
                    p.catch(e => console.log('Erro ao tocar próximo vídeo', e));
                }
            }
        }
    }, 1100); // 1.1s por cena

    // Cronograma da Abertura (Coreografia) MAIS LENTA E COM SUSPENSE
    setTimeout(() => {
        // Passo 1: Revela o fundo preto (formando as letras) e dá um Zoom Out
        const maskLayer = document.getElementById('marvelMask');
        if(maskLayer) maskLayer.classList.add('show-mask');
        marvelText.classList.add('zoom-out');
    }, 500); // 0.5s

    setTimeout(() => {
        // Passo 2: Revelação suave da última foto (alianças)
        const maskLayer = document.getElementById('marvelMask');
        if(maskLayer) {
            maskLayer.style.transition = 'opacity 1s ease-in-out';
            maskLayer.style.opacity = '0'; 
        }
    }, 4600); // 4.6s 

    setTimeout(() => {
        // Passo 3: Transição Suave para o Suspense (Blackout)
        const maskLayer = document.getElementById('marvelMask');
        if(maskLayer) {
            // Voltamos com a máscara mas de forma suave, preparando para o texto sólido
            maskLayer.style.transition = 'opacity 0.8s ease-in-out';
            maskLayer.style.opacity = '1';
            
            // Mudamos o modo de blend um pouco depois para não dar "pulo" visual
            setTimeout(() => {
                maskLayer.style.mixBlendMode = 'normal';
            }, 100);
        }
        
        // Os vídeos somem suavemente ao fundo
        marvelBackground.style.transition = 'opacity 1.5s ease-in-out';
        marvelBackground.style.opacity = '0';
        
        clearInterval(slideshowInterval); 
    }, 5500); // 5.5s

    setTimeout(() => {
        // Passo 4: Revela o subtítulo lentamente
        const marvelSubtitle = document.getElementById('marvelSubtitle');
        if(marvelSubtitle) marvelSubtitle.style.opacity = '1';
    }, 7000); // 7.0s 

    // =======================================================
    // PASSO DE FADE-OUT DO ÁUDIO (Suavização final)
    // =======================================================
    setTimeout(() => {
        if(introMusic) {
            let fadeAudio = setInterval(() => {
                if (introMusic.volume > 0.05) {
                    introMusic.volume -= 0.05; // Diminui o volume gradualmente
                } else {
                    introMusic.volume = 0;
                    introMusic.pause(); // Pausa a música ao chegar a 0
                    clearInterval(fadeAudio);
                }
            }, 100); // Roda a cada 100ms. Durante 2s (20 passos) o volume zera.
        }
    }, 8500); // Começa aos 8.5s para terminar em 10.5s (exatamente no clarão)

    setTimeout(() => {
        // Passo 5: O clarão branco (Flash) catártico
        flashEffect.style.opacity = '1';
    }, 10500); // 10.5s

    setTimeout(() => {
        // Passo 6: Limpar a abertura e revelar o site por baixo da transição de flash
        marvelIntroContainer.style.display = 'none'; // Some com a Marvel Layer
        
        // Mostrar o corpo do convite
        mainContent.classList.add('visible');
        
        // Liberar o Scroll da página para os convidados
        body.classList.remove('locked-scroll');
        
        // Fazer o flash desaparecer suavemente, revelando a nova tela "Hero"
        flashEffect.style.opacity = '0';
        
    }, 11000); // 11.0s


    /* =======================================================
       2. ANIMAÇÕES DE ROLAGEM (SCROLL REVEAL)
       ======================================================= */
    
    // Configuração do Intersection Observer para animar os itens quando entram na tela
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // 15% do elemento tem que estar visível para animar
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target); // Só anima 1 vez
            }
        });
    }, observerOptions);

    // Selecionar todos os elementos que possuem a classe .fade-in-up e aplicar o observador
    const elementsToReveal = document.querySelectorAll('.fade-in-up');
    elementsToReveal.forEach(el => {
        scrollObserver.observe(el);
    });

});
