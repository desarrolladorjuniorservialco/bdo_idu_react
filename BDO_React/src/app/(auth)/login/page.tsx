

<m.div
  ref={panelRef}
  className="hidden lg:flex lg:w-[46%] relative overflow-hidden"
  style={{
    background:
      'radial-gradient(circle at top left, rgba(14,58,102,0.35), transparent 35%), linear-gradient(160deg, #061427 0%, #071B34 45%, #040B14 100%)',
  }}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 1 }}
>
  {/* ─────────────────────────────────────
      BASE GRID
  ───────────────────────────────────── */}
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: `
        linear-gradient(rgba(79,195,247,0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(79,195,247,0.035) 1px, transparent 1px)
      `,
      backgroundSize: '42px 42px',
      opacity: 0.9,
    }}
  />

  {/* MAJOR GRID */}
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: `
        linear-gradient(rgba(79,195,247,0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(79,195,247,0.08) 1px, transparent 1px)
      `,
      backgroundSize: '210px 210px',
      opacity: 0.35,
    }}
  />

  {/* ─────────────────────────────────────
      SOFT GLOW
  ───────────────────────────────────── */}
  <div
    aria-hidden
    style={{
      position: 'absolute',
      width: 500,
      height: 500,
      borderRadius: '50%',
      background: 'rgba(79,195,247,0.06)',
      filter: 'blur(120px)',
      top: -120,
      left: -120,
    }}
  />

  {/* ─────────────────────────────────────
      BLUEPRINT SCENE
  ───────────────────────────────────── */}
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      transform: `translate(${pos.x * 0.35}px, ${pos.y * 0.35}px)`,
      transition: 'transform 1.4s cubic-bezier(0.23,1,0.32,1)',
    }}
  >
    <svg
      viewBox="0 0 900 900"
      style={{
        width: '100%',
        height: '100%',
        opacity: 0.9,
      }}
    >
      {/* ATMOSPHERIC DEPTH */}
      <defs>
        <linearGradient id="roadFade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(79,195,247,0)" />
          <stop offset="100%" stopColor="rgba(79,195,247,0.25)" />
        </linearGradient>

        <filter id="cyanGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* PERSPECTIVE ROADS */}
      <path
        d="M 300 900 L 430 520"
        stroke="rgba(79,195,247,0.18)"
        strokeWidth="2"
        fill="none"
        strokeDasharray="1200"
        strokeDashoffset="1200"
        style={{
          animation: 'bob-draw 2.8s ease forwards',
        }}
      />

      <path
        d="M 620 900 L 470 520"
        stroke="rgba(79,195,247,0.18)"
        strokeWidth="2"
        fill="none"
        strokeDasharray="1200"
        strokeDashoffset="1200"
        style={{
          animation: 'bob-draw 2.8s ease 0.2s forwards',
        }}
      />

      {/* CENTER AVENUE */}
      <line
        x1="450"
        y1="520"
        x2="450"
        y2="900"
        stroke="rgba(217,164,65,0.22)"
        strokeWidth="1.2"
        strokeDasharray="1200"
        strokeDashoffset="1200"
        style={{
          animation: 'bob-draw 2.5s ease 0.4s forwards',
        }}
      />

      {/* BUILDINGS */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect
            x={120 + i * 90}
            y={360 - i * 20}
            width={60}
            height={260 + i * 30}
            fill="none"
            stroke="rgba(79,195,247,0.24)"
            strokeWidth="1"
            strokeDasharray="1000"
            strokeDashoffset="1000"
            style={{
              animation: `bob-draw 2s ease ${0.8 + i * 0.12}s forwards`,
            }}
          />

          {/* WINDOWS */}
          {[0, 1, 2, 3, 4, 5].map((r) =>
            [0, 1].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={130 + i * 90 + c * 24}
                y={380 - i * 20 + r * 34}
                width={10}
                height={18}
                fill="none"
                stroke="rgba(79,195,247,0.12)"
                strokeWidth="0.6"
              />
            ))
          )}
        </g>
      ))}

      {/* RIGHT SIDE BUILDINGS */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={620 + i * 70}
            y={380 - i * 18}
            width={58}
            height={240 + i * 20}
            fill="none"
            stroke="rgba(79,195,247,0.22)"
            strokeWidth="1"
            strokeDasharray="1000"
            strokeDashoffset="1000"
            style={{
              animation: `bob-draw 2s ease ${1.2 + i * 0.15}s forwards`,
            }}
          />
        </g>
      ))}

      {/* TOWER CRANE */}
      <g filter="url(#cyanGlow)">
        <line
          x1="520"
          y1="250"
          x2="520"
          y2="690"
          stroke="rgba(217,164,65,0.42)"
          strokeWidth="1.2"
          strokeDasharray="1200"
          strokeDashoffset="1200"
          style={{
            animation: 'bob-draw 2.2s ease 1s forwards',
          }}
        />

        <line
          x1="520"
          y1="260"
          x2="760"
          y2="260"
          stroke="rgba(217,164,65,0.42)"
          strokeWidth="1.2"
          strokeDasharray="1200"
          strokeDashoffset="1200"
          style={{
            animation: 'bob-draw 1.6s ease 1.4s forwards',
          }}
        />

        <line
          x1="640"
          y1="260"
          x2="640"
          y2="420"
          stroke="rgba(217,164,65,0.28)"
          strokeWidth="1"
          strokeDasharray="1200"
          strokeDashoffset="1200"
          style={{
            animation: 'bob-draw 1.1s ease 1.9s forwards',
          }}
        />
      </g>

      {/* EXCAVATOR SILHOUETTE */}
      <g opacity="0.7">
        <rect
          x="210"
          y="700"
          width="90"
          height="32"
          rx="3"
          fill="none"
          stroke="rgba(79,195,247,0.22)"
          strokeWidth="1"
          strokeDasharray="400"
          strokeDashoffset="400"
          style={{
            animation: 'bob-draw 1.4s ease 2s forwards',
          }}
        />

        <line
          x1="210"
          y1="700"
          x2="160"
          y2="650"
          stroke="rgba(79,195,247,0.22)"
          strokeWidth="1"
          strokeDasharray="400"
          strokeDashoffset="400"
          style={{
            animation: 'bob-draw 1.2s ease 2.2s forwards',
          }}
        />

        <line
          x1="160"
          y1="650"
          x2="120"
          y2="690"
          stroke="rgba(79,195,247,0.22)"
          strokeWidth="1"
          strokeDasharray="400"
          strokeDashoffset="400"
          style={{
            animation: 'bob-draw 1.1s ease 2.35s forwards',
          }}
        />
      </g>

      {/* CAD DIMENSIONS */}
      <line
        x1="110"
        y1="760"
        x2="320"
        y2="760"
        stroke="rgba(79,195,247,0.14)"
        strokeWidth="0.8"
      />

      <text
        x="180"
        y="748"
        fill="rgba(79,195,247,0.32)"
        fontSize="10"
        style={{
          fontFamily: 'monospace',
          letterSpacing: '0.18em',
        }}
      >
        AV-01 / SECTION A
      </text>

      {/* TOPOGRAPHIC NODES */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <circle
            cx={160 + i * 180}
            cy={160 + i * 70}
            r="10"
            fill="none"
            stroke="rgba(79,195,247,0.14)"
            strokeWidth="1"
            style={{
              animation: `bob-pulse ${3 + i}s ease-in-out infinite`,
            }}
          />
        </g>
      ))}
    </svg>
  </div>

  {/* ─────────────────────────────────────
      SCAN LINE
  ───────────────────────────────────── */}
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      background:
        'linear-gradient(to bottom, transparent 0%, rgba(79,195,247,0.03) 50%, transparent 100%)',
      backgroundSize: '100% 240px',
      animation: 'bob-scan 12s linear infinite',
      opacity: 0.5,
      pointerEvents: 'none',
    }}
  />

  {/* ─────────────────────────────────────
      HERO CONTENT
  ───────────────────────────────────── */}
  <div
    style={{
      position: 'relative',
      zIndex: 10,
      padding: '64px 58px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: '100%',
    }}
  >
    {/* TOP */}
    <div>
      <div
        style={{
          width: 58,
          height: 2,
          background:
            'linear-gradient(90deg, rgba(79,195,247,0.8), transparent)',
          marginBottom: 14,
        }}
      />

      <p
        style={{
          color: 'rgba(79,195,247,0.55)',
          fontSize: 10,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        Plataforma digital · Infraestructura urbana
      </p>
    </div>

    {/* CENTER */}
    <div
      style={{
        maxWidth: 360,
        transform: `translate(${pos.x * 0.8}px, ${pos.y * 0.8}px)`,
        transition: 'transform 1.2s cubic-bezier(0.23,1,0.32,1)',
      }}
    >
      <h1
        style={{
          fontSize: 118,
          lineHeight: 0.88,
          fontWeight: 800,
          color: '#F5F7FA',
          letterSpacing: '-0.08em',
          marginBottom: 28,
          textShadow: '0 0 60px rgba(79,195,247,0.08)',
        }}
      >
        BOB
      </h1>

      <div
        style={{
          width: 60,
          height: 1,
          background: 'rgba(217,164,65,0.6)',
          marginBottom: 20,
        }}
      />

      <p
        style={{
          color: '#D9A441',
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: '0.08em',
          marginBottom: 14,
        }}
      >
        Sistema de bitácora digital
      </p>

      <p
        style={{
          color: 'rgba(245,247,250,0.46)',
          lineHeight: 1.8,
          fontSize: 13,
          maxWidth: 320,
        }}
      >
        Supervisión técnica y control digital de obras de infraestructura y espacio público.
      </p>

      {/* TAGS */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginTop: 28,
          flexWrap: 'wrap',
        }}
      >
        {['BIM', 'Infraestructura', 'Supervisión', 'Control'].map((tag) => (
          <div
            key={tag}
            style={{
              border: '1px solid rgba(79,195,247,0.14)',
              background: 'rgba(79,195,247,0.03)',
              padding: '6px 12px',
              borderRadius: 999,
              color: 'rgba(79,195,247,0.6)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>

    {/* BOTTOM */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        opacity: 0.4,
      }}
    >
      <ServialcoMark />

      <div>
        <p
          style={{
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            marginBottom: 4,
          }}
        >
          Powered by
        </p>

        <p
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.55)',
            letterSpacing: '0.08em',
          }}
        >
          Servialco
        </p>
      </div>
    </div>
  </div>
</m.div>