import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import crypto from "crypto";
import { Vehicle } from "../vehicle/models/vehicle.model";

type ChatRole = "user" | "model";

interface ChatMessage {
  role: ChatRole;
  text: string;
  createdAt: string;
  matchedVehicles?: SuggestedVehicle[];
  action?: string;
  context?: ConversationContext | null;
}

interface ConversationContext {
  destination?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  seatsNeeded?: number;
  vehicleType?: string;
  purpose?: string;
  hasDriver?: boolean;
  requestedVehicleName?: string;
  requestedBrand?: string;
  maxPrice?: number;
  minPrice?: number;
}

interface SuggestedVehicle {
  id: string;
  name: string;
  brand?: string;
  type?: string;
  seats?: number;
  image?: string;
  price?: number;
  year?: number;
  color?: string;
  description?: string;
}

interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  context: ConversationContext;
}

interface ConversationParams {
  id: string;
}

interface SendMessageBody {
  message?: string;
  systemPrompt?: string;
}

const router = Router();
const conversations = new Map<string, Conversation>();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY in .env");
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

const nowIso = () => new Date().toISOString();

const DEFAULT_SYSTEM_PROMPT = `
Bạn là trợ lý AI chính thức của EV Rental System.

EV Rental System là web cho thuê xe điện tự lái có tích hợp chatbot AI.

Quy tắc bắt buộc:
- Chỉ được giới thiệu là "trợ lý AI của EV Rental System"
- Không được tự bịa tên công ty, thương hiệu, ứng dụng hoặc tổ chức khác
- Không được bịa dữ liệu xe, giá, tồn kho hoặc booking nếu hệ thống chưa cung cấp
- Nếu thiếu dữ liệu thật, phải nói rõ: "mình chưa có thông tin chính xác trong hệ thống"
- Luôn trả lời bằng tiếng Việt, trừ khi người dùng yêu cầu ngôn ngữ khác
- Xưng "mình", gọi người dùng là "bạn"
- Không dùng "quý khách"
- Không dùng markdown như **in đậm**
- Không trả lời như Wikipedia, không viết kiểu tài liệu
- Không lan man
- Nếu người dùng đã cung cấp thông tin trước đó thì phải dùng lại ngữ cảnh đó
- Không hỏi lại thông tin đã rõ
- Nếu cần hỏi thêm, chỉ hỏi đúng phần còn thiếu

Mục tiêu:
- Tư vấn thuê xe điện trong hệ thống EV Rental System
- Hỏi ngắn gọn để lấy đủ thông tin: số người, thời gian thuê, điểm nhận/trả, mục đích chuyến đi, loại xe mong muốn
- Khi đã có dữ liệu xe phù hợp từ hệ thống, hãy gợi ý 2 đến 4 xe cụ thể
- Nếu người dùng chỉ nhắn ngắn như "SUV", "MPV", "vf7", "5 ngày", "4 người", hãy hiểu đó là phần bổ sung ngữ cảnh

Ngoài phạm vi:
- Nếu người dùng hỏi ngoài phạm vi thuê xe hoặc không liên quan đến xe/đặt xe/tư vấn xe, hãy lịch sự nói đây là chatbot tư vấn thuê xe của EV Rental System và mời người dùng hỏi lại nội dung liên quan
- Không cố trả lời kiến thức ngoài phạm vi

Phong cách:
- Tự nhiên như chat thật
- Thân thiện, thông minh, gọn
- Ưu tiên 2 đến 6 câu ngắn
- Nếu cần liệt kê thì dùng gạch đầu dòng ngắn
`;

const SUPPORTED_BRANDS = [
  "vinfast",
  "tesla",
  "bmw",
  "audi",
  "mercedes",
  "hyundai",
  "kia",
  "porsche",
  "byd",
];

const KNOWN_LOCATIONS = [
  "nha trang",
  "da lat",
  "vung tau",
  "hoi an",
  "da nang",
  "quan 7",
  "suoi tien",
  "ha noi",
  "tp.hcm",
  "tphcm",
  "sai gon",
  "ho chi minh",
  "noi bai",
  "tan son nhat",
];

const OUT_OF_SCOPE_KEYWORDS = [
  "con meo",
  "con chó",
  "con cho",
  "nấu ăn",
  "nau an",
  "giải toán",
  "giai toan",
  "code hộ",
  "code ho",
  "viết thơ",
  "viet tho",
  "bói",
  "boi",
  "xem tử vi",
  "tu vi",
  "phim",
  "ca sĩ",
  "ca si",
  "game",
];

const BRAND_FALLBACKS: Record<string, string[]> = {
  audi: ["VF7", "VF8", "BMW i4", "BMW i5"],
  bmw: ["BMW i4", "BMW i5", "VF7", "VF8"],
  mercedes: ["VF8", "VF9", "Audi Q8 e-tron"],
  tesla: ["VF7", "VF8", "BMW i4"],
  vinfast: ["VF5", "VF6", "VF7", "VF8", "VF9"],
};

const createConversation = (): Conversation => {
  const now = nowIso();

  const conversation: Conversation = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    messages: [],
    context: {},
  };

  conversations.set(conversation.id, conversation);
  return conversation;
};

const getConversation = (id: string): Conversation | null => {
  return conversations.get(id) || null;
};

const deleteConversation = (id: string): boolean => {
  return conversations.delete(id);
};

const toGeminiHistory = (messages: ChatMessage[]) => {
  return messages.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));
};

const normalizeReply = (text?: string) => {
  if (!text || !text.trim()) {
    return "Mình chưa có câu trả lời phù hợp.";
  }

  return text
    .replace(/\*\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/E-Ride Việt Nam/gi, "EV Rental System")
    .replace(/E-Ride/gi, "EV Rental System")
    .trim();
};

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const mergeContext = (
  current: ConversationContext,
  updates: Partial<ConversationContext>
): ConversationContext => {
  return {
    ...current,
    ...Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    ),
  };
};

const isOutOfScope = (message: string) => {
  const text = normalizeText(message);
  return OUT_OF_SCOPE_KEYWORDS.some((kw) => text.includes(normalizeText(kw)));
};

const extractContextFromMessage = (
  message: string,
  current: ConversationContext
): ConversationContext => {
  const text = normalizeText(message);
  const next: Partial<ConversationContext> = {};

  if (/\bsuv\b/.test(text)) next.vehicleType = "SUV";
  if (/\bsedan\b/.test(text)) next.vehicleType = "Sedan";
  if (/\bcrossover\b/.test(text)) next.vehicleType = "Crossover";
  if (/\bcoupe\b/.test(text)) next.vehicleType = "Coupe";
  if (/\bmpv\b/.test(text)) next.vehicleType = "MPV";

  if (text.includes("co tai xe")) next.hasDriver = true;
  if (text.includes("tu lai")) next.hasDriver = false;

  if (text.includes("dam cuoi")) next.purpose = "đám cưới";
  else if (text.includes("du lich")) next.purpose = "du lịch";
  else if (text.includes("cong tac")) next.purpose = "công tác";
  else if (text.includes("san bay")) next.purpose = "đi sân bay";
  else if (text.includes("ve que")) next.purpose = "về quê";

  const seatsMatch = text.match(/(\d+)\s*(nguoi|cho)/i);
  if (seatsMatch) next.seatsNeeded = Number(seatsMatch[1]);

  const daysMatch = text.match(/(\d+)\s*ngay/i);
  if (daysMatch) next.days = Number(daysMatch[1]);

  const dateMatch = message.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (dateMatch && !current.startDate) {
    const day = dateMatch[1].padStart(2, "0");
    const month = dateMatch[2].padStart(2, "0");
    const year = dateMatch[3]
      ? dateMatch[3].length === 2
        ? `20${dateMatch[3]}`
        : dateMatch[3]
      : String(new Date().getFullYear());

    next.startDate = `${year}-${month}-${day}`;
  }

  const vfMatch = message.match(
    /\b(vf\s*3|vf\s*5|vf\s*6|vf\s*7|vf\s*8|vf\s*9|vf3|vf5|vf6|vf7|vf8|vf9)\b/i
  );
  if (vfMatch) {
    next.requestedVehicleName = vfMatch[0].toUpperCase().replace(/\s+/g, "");
  }

  const commonModelMatch = message.match(
    /\b(i4|i5|ix|q8\s*e-tron|e-tron\s*gt|model\s*3|model\s*y|model\s*s|vf7|vf8|vf9|vf6|vf5)\b/i
  );
  if (commonModelMatch) {
    next.requestedVehicleName = commonModelMatch[0].replace(/\s+/g, " ").trim();
  }

  for (const brand of SUPPORTED_BRANDS) {
    if (text.includes(brand)) {
      next.requestedBrand = brand;
      if (!next.requestedVehicleName) {
        next.requestedVehicleName = brand;
      }
      break;
    }
  }

  for (const loc of KNOWN_LOCATIONS) {
    if (text.includes(loc)) {
      if (!current.destination) {
        next.destination = loc;
      } else if (!current.pickupLocation) {
        next.pickupLocation = loc;
      }
    }
  }

  // Extract price requirements
  const pricePatterns = [
    /duoi\s*(\d+)\s*(trieu|tr)/i,
    /toi\s*da\s*(\d+)\s*(trieu|tr)/i,
    /khong\s*qua\s*(\d+)\s*(trieu|tr)/i,
    /nho\s*hon\s*(\d+)\s*(trieu|tr)/i,
  ];

  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      const priceValue = Number(match[1]);
      if (priceValue > 0) {
        next.maxPrice = priceValue; // Store in millions (triệu)
      }
      break;
    }
  }

  // Extract price range first (e.g., "từ 1 đến 2 triệu")
  const rangePricePattern = /tu\s*(\d+)\s*den\s*(\d+)\s*(trieu|tr)/i;
  const rangeMatch = text.match(rangePricePattern);
  if (rangeMatch) {
    const minValue = Number(rangeMatch[1]);
    const maxValue = Number(rangeMatch[2]);
    if (minValue > 0) next.minPrice = minValue;
    if (maxValue > 0) next.maxPrice = maxValue;
  } else {
    // Extract minimum price (only if not a range)
    // Use strict "greater than" by adding 0.001 to create > instead of >=
    const minPricePatterns = [
      /tren\s*(\d+)\s*(trieu|tr)/i,        // trên X triệu → strict >
      /lon\s*hon\s*(\d+)\s*(trieu|tr)/i,   // lớn hơn X triệu → strict >
      /cao\s*hon\s*(\d+)\s*(trieu|tr)/i,   // cao hơn X triệu → strict >
    ];

    for (const pattern of minPricePatterns) {
      const match = text.match(pattern);
      if (match) {
        const priceValue = Number(match[1]);
        if (priceValue > 0) {
          // Add 0.001 to make it strict > instead of >=
          next.minPrice = priceValue + 0.001;
        }
        break;
      }
    }
  }

  return mergeContext(current, next);
};

const mapVehicleDoc = (v: any): SuggestedVehicle => ({
  id: String(v._id),
  name: v.vehicleName || v.name || "Xe điện",
  brand: v.vehicleBrand || v.brand || "",
  type: v.vehicleType,
  seats: v.vehicleDetail?.vehicleSeatCount,
  image: v.vehicleDetail?.vehicleImage,
  price: Number(
  v.pricePerDay ??
    v.vehiclePrice ??
    v.rentalPrice ??
    v.price ??
    0
),
  year: v.vehicleDetail?.vehicleYear,
  color: v.vehicleDetail?.vehicleColor,
  description: v.description || "",
});

const scoreVehicle = (
  vehicle: SuggestedVehicle,
  context: ConversationContext
): number => {
  let score = 0;

  const normalizedName = normalizeText(vehicle.name || "");
  const normalizedBrand = normalizeText(vehicle.brand || "");

  if (context.requestedVehicleName) {
    const requested = normalizeText(context.requestedVehicleName);
    if (normalizedName.includes(requested)) score += 10;
    if (normalizedBrand.includes(requested)) score += 7;
  }

  if (context.requestedBrand) {
    const requestedBrand = normalizeText(context.requestedBrand);
    if (normalizedBrand.includes(requestedBrand)) score += 12;
  }

  if (context.vehicleType && vehicle.type === context.vehicleType) score += 4;

  if (context.seatsNeeded && vehicle.seats && vehicle.seats >= context.seatsNeeded) {
    score += 3;
    score += Math.max(0, 2 - (vehicle.seats - context.seatsNeeded));
  }

  if (vehicle.price) score += 1;

  return score;
};

const findMatchingVehicles = async (
  context: ConversationContext
): Promise<SuggestedVehicle[]> => {
  try {
    const docs = await (Vehicle as any).find({}).limit(100);
    const vehicles = (Array.isArray(docs) ? docs : []).map(mapVehicleDoc);

    let filtered = vehicles;

    if (context.requestedBrand) {
      const requestedBrand = normalizeText(context.requestedBrand);
      const byBrand = filtered.filter((v) =>
        normalizeText(v.brand || "").includes(requestedBrand)
      );
      if (byBrand.length > 0) filtered = byBrand;
    }

    if (context.requestedVehicleName) {
      const requested = normalizeText(context.requestedVehicleName);
      const byName = filtered.filter(
        (v) =>
          normalizeText(v.name || "").includes(requested) ||
          normalizeText(v.brand || "").includes(requested)
      );
      if (byName.length > 0) filtered = byName;
    }

    if (context.vehicleType) {
      const byType = filtered.filter((v) => v.type === context.vehicleType);
      if (byType.length > 0) filtered = byType;
    }

    if (context.seatsNeeded) {
      const bySeats = filtered.filter(
        (v) => !v.seats || v.seats >= (context.seatsNeeded || 0)
      );
      if (bySeats.length > 0) filtered = bySeats;
    }

    // Filter by price range (convert triệu to nghìn for comparison)
    if (context.maxPrice !== undefined) {
      const maxPriceInThousands = context.maxPrice * 1000; // Convert triệu to nghìn
      const byMaxPrice = filtered.filter(
        (v) => !v.price || v.price <= maxPriceInThousands
      );
      if (byMaxPrice.length > 0) filtered = byMaxPrice;
    }

    if (context.minPrice !== undefined) {
      const minPriceInThousands = context.minPrice * 1000; // Convert triệu to nghìn
      const byMinPrice = filtered.filter(
        (v) => v.price && v.price >= minPriceInThousands
      );
      if (byMinPrice.length > 0) filtered = byMinPrice;
    }

    filtered = filtered
      .sort((a, b) => scoreVehicle(b, context) - scoreVehicle(a, context))
      .slice(0, 4);

    return filtered;
  } catch (error) {
    console.error("findMatchingVehicles error:", error);
    return [];
  }
};

const buildBrandFallbackVehicles = async (
  brand: string
): Promise<SuggestedVehicle[]> => {
  const candidates = BRAND_FALLBACKS[brand] || ["VF7", "VF8", "VF9"];

  try {
    const docs = await (Vehicle as any).find({}).limit(100);
    const vehicles = (Array.isArray(docs) ? docs : []).map(mapVehicleDoc);

    const matched = vehicles.filter((v) =>
      candidates.some((keyword) =>
        normalizeText(v.name || "").includes(normalizeText(keyword))
      )
    );

    return matched.slice(0, 4);
  } catch (error) {
    console.error("buildBrandFallbackVehicles error:", error);
    return [];
  }
};

const getSuggestedAction = (
  context: ConversationContext,
  matchedVehicles: SuggestedVehicle[]
) => {
  if (matchedVehicles.length > 0) return "suggest_vehicle";
  if (
    context.seatsNeeded ||
    context.vehicleType ||
    context.requestedVehicleName ||
    context.requestedBrand ||
    context.destination
  ) {
    return "ask_more";
  }
  return "chat";
};

const buildOutOfScopeReply = () =>
  "Mình là trợ lý AI của EV Rental System, hiện chỉ hỗ trợ tư vấn thuê xe điện và gợi ý xe phù hợp trong hệ thống. Bạn có thể hỏi mình về loại xe, số chỗ, thời gian thuê hoặc mẫu xe bạn muốn tìm nhé.";

router.post("/", async (req: Request, res: Response) => {
  try {
    const { message } = req.body as { message?: string };

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        data: {
          reply: "Bạn hãy nhập nội dung cần hỏi nhé.",
        },
      });
    }

    if (isOutOfScope(message)) {
      return res.status(200).json({
        success: true,
        data: {
          reply: buildOutOfScopeReply(),
          matchedVehicles: [],
          action: "chat",
        },
      });
    }

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      config: {
        systemInstruction: DEFAULT_SYSTEM_PROMPT,
        temperature: 0.6,
        topP: 0.9,
      },
      contents: `Khách hàng hỏi: ${message.trim()}

Hãy trả lời ngắn gọn, tự nhiên, đúng vai trò trợ lý AI của EV Rental System.`,
    });

    return res.status(200).json({
      success: true,
      data: {
        reply: normalizeReply(result.text),
        matchedVehicles: [],
        action: "chat",
      },
    });
  } catch (error: any) {
    console.error("Quick chat API error:", error);

    const msg =
      error?.message?.includes("quota") ||
      error?.message?.includes("RESOURCE_EXHAUSTED")
        ? "AI đang quá tải hôm nay. Bạn thử lại sau một chút nhé."
        : "Có lỗi xảy ra khi gọi AI.";

    return res.status(200).json({
      success: false,
      data: {
        reply: msg,
        matchedVehicles: [],
        action: "chat",
      },
    });
  }
});

router.post("/conversations", (_req: Request, res: Response) => {
  const conversation = createConversation();

  return res.status(201).json({
    success: true,
    message: "Conversation created successfully",
    data: {
      conversationId: conversation.id,
      createdAt: conversation.createdAt,
    },
  });
});

router.get(
  "/conversations/:id",
  (req: Request<ConversationParams>, res: Response) => {
    const conversation = getConversation(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  }
);

router.delete(
  "/conversations/:id",
  (req: Request<ConversationParams>, res: Response) => {
    const existed = deleteConversation(req.params.id);

    return res.status(200).json({
      success: true,
      message: existed
        ? "Conversation deleted successfully"
        : "Conversation did not exist",
    });
  }
);

router.post(
  "/conversations/:id/messages",
  async (
    req: Request<ConversationParams, unknown, SendMessageBody>,
    res: Response
  ) => {
    try {
      const { id } = req.params;
      const { message, systemPrompt } = req.body;

      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({
          success: false,
          data: {
            reply: "Bạn hãy nhập nội dung cần hỏi nhé.",
          },
        });
      }

      const conversation = getConversation(id);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }

      const userMessage: ChatMessage = {
        role: "user",
        text: message.trim(),
        createdAt: nowIso(),
      };

      if (isOutOfScope(userMessage.text)) {
        const replyText = buildOutOfScopeReply();

        const modelMessage: ChatMessage = {
          role: "model",
          text: replyText,
          createdAt: nowIso(),
          matchedVehicles: [],
          action: "chat",
          context: conversation.context,
        };

        conversation.messages.push(userMessage, modelMessage);
        conversation.updatedAt = nowIso();

        return res.status(200).json({
          success: true,
          data: {
            conversationId: conversation.id,
            reply: replyText,
            messages: conversation.messages,
            context: conversation.context,
            matchedVehicles: [],
            action: "chat",
          },
        });
      }

      conversation.context = extractContextFromMessage(
        userMessage.text,
        conversation.context
      );

      let matchedVehicles = await findMatchingVehicles(conversation.context);

      const requestedBrand = conversation.context.requestedBrand;
      const requestedVehicleName = conversation.context.requestedVehicleName;

      let brandNote = "";

      if (
        requestedBrand &&
        matchedVehicles.length === 0 &&
        SUPPORTED_BRANDS.includes(requestedBrand)
      ) {
        const fallbackVehicles = await buildBrandFallbackVehicles(requestedBrand);
        if (fallbackVehicles.length > 0) {
          matchedVehicles = fallbackVehicles;
          brandNote = `Người dùng đang hỏi hãng "${requestedBrand}", nhưng hiện không tìm thấy đúng mẫu yêu cầu trong hệ thống. Hãy nói rõ điều này và gợi ý các mẫu gần tương đương từ danh sách xe được cung cấp.`;
        }
      }

      const contextSummary = JSON.stringify(conversation.context, null, 2);
      const vehicleSummary = JSON.stringify(matchedVehicles, null, 2);

      const finalSystemPrompt = systemPrompt?.trim()
        ? `${DEFAULT_SYSTEM_PROMPT}\n\n${systemPrompt.trim()}`
        : DEFAULT_SYSTEM_PROMPT;

      const history = toGeminiHistory(conversation.messages);

      const chat = ai.chats.create({
        model: GEMINI_MODEL,
        history,
        config: {
          systemInstruction: finalSystemPrompt,
          temperature: 0.6,
          topP: 0.9,
        },
      });

      const prompt = `
Đây là ngữ cảnh hiện tại của khách:
${contextSummary}

Đây là các xe phù hợp đang có trong hệ thống:
${vehicleSummary}

Thông tin thêm:
- requestedBrand: ${requestedBrand || "không có"}
- requestedVehicleName: ${requestedVehicleName || "không có"}
${brandNote ? `- ghi chú xử lý thương hiệu: ${brandNote}` : ""}

Yêu cầu:
- Nếu đã có xe phù hợp, hãy gợi ý 2 đến 4 xe cụ thể từ danh sách trên
- Không được bịa thêm xe ngoài danh sách
- Nếu khách vừa gửi tin nhắn ngắn như "SUV", "MPV", "vf7", "5 ngày", "4 người" thì hiểu đó là bổ sung ngữ cảnh
- Nếu người dùng hỏi một hãng hoặc mẫu xe có trong hệ thống, hãy trả lời dựa trên dữ liệu xe thật trong hệ thống
- Nếu người dùng hỏi một hãng xe không có đúng mẫu trong hệ thống nhưng có xe điện tương tự, hãy nói rõ hiện chưa có đúng mẫu đó và gợi ý xe tương tự từ danh sách
- Nếu người dùng hỏi ngoài hệ thống mà không có dữ liệu, nói rõ là chưa có thông tin chính xác trong hệ thống
- Nếu đã đủ dữ liệu cơ bản, hãy tư vấn tiếp và gợi ý xe
- Nếu còn thiếu dữ liệu để tư vấn tốt hơn, chỉ hỏi đúng 1 câu ngắn
- Nếu danh sách xe rỗng, nói rõ là hiện chưa tìm thấy xe phù hợp trong hệ thống

Tin nhắn mới của khách:
${userMessage.text}
`;

      const result = await chat.sendMessage({
        message: prompt,
      });

      const replyText = normalizeReply(result.text);
      const action = getSuggestedAction(conversation.context, matchedVehicles);

      const modelMessage: ChatMessage = {
        role: "model",
        text: replyText,
        createdAt: nowIso(),
        matchedVehicles,
        action,
        context: conversation.context,
      };

      conversation.messages.push(userMessage, modelMessage);
      conversation.updatedAt = nowIso();

      return res.status(200).json({
        success: true,
        data: {
          conversationId: conversation.id,
          reply: replyText,
          messages: conversation.messages,
          context: conversation.context,
          matchedVehicles,
          action,
        },
      });
    } catch (error: any) {
      console.error("Chat API error full:", error);

      const reply =
        error?.message?.includes("quota") ||
        error?.message?.includes("RESOURCE_EXHAUSTED")
          ? "AI đang quá tải hôm nay. Bạn thử lại sau một chút nhé."
          : "Có lỗi xảy ra khi gọi AI.";

      return res.status(200).json({
        success: false,
        data: {
          reply,
          matchedVehicles: [],
          action: "chat",
        },
      });
    }
  }
);

export default router;