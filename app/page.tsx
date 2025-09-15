import LightRays from "@/components/light-rays"

export default function SplashScreen() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#FFFFFF"
          raysSpeed={1}
          lightSpread={2}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.15}
          noiseAmount={0}
          distortion={0.03}
          pulsating={false}
          fadeDistance={0.8}
          saturation={1}
          className="w-full h-full"
        />
      </div>
    </div>
  )
}
