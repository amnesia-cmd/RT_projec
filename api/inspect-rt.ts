export default async function handler(req: any, res: any) {
  try {
    const { app } = await import("../server");
    return app(req, res);
  } catch (error: any) {
    console.error("Vercel API initialization error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to initialize inspection API.",
    });
  }
}
