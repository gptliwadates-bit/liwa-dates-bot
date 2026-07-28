/**
 * وكيل تمور ليوا — سيرفر Webhook يوصّل Meta (فيسبوك/انستجرام/واتساب) بـ OpenAI (ChatGPT)
 * ---------------------------------------------------------------------------
 * التشغيل:
 *   1) npm init -y
 *   2) npm install express
 *   3) اعمل ملف .env أو حط المتغيرات في إعدادات الاستضافة (Render/Railway)
 *   4) node webhook-server.js
 *
 * المتغيرات المطلوبة (Environment Variables):
 *   OPENAI_API_KEY      = مفتاح OpenAI من platform.openai.com/api-keys
 *   META_VERIFY_TOKEN   = كلمة سر تخترعها إنت (نفسها في إعداد Webhook بميتا)
 *   PAGE_ACCESS_TOKEN   = توكن صفحة الفيسبوك (يشتغل للانستجرام كمان)
 *   WHATSAPP_TOKEN      = توكن الواتساب
 *   WHATSAPP_PHONE_ID   = الـ Phone Number ID بتاع الواتساب
 *   TELEGRAM_BOT_TOKEN  = (اختياري) توكن بوت تيليجرام لتنبيهات الأوردر
 *   TELEGRAM_CHAT_ID    = (اختياري) الـ chat id اللي التنبيه يتبعت له
 */

const express = require("express");
const app = express();
app.use(express.json());

// ===== المتغيرات =====
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

const AI_MODEL = "gpt-4o-mini"; // أرخص وأسرع. للجودة الأعلى استخدم "gpt-4o"

// ===== إعدادات التحويل لموظف بشري (Human Handoff) =====
// العلامة اللي كلود بيحطها في آخر رده لما يقرر إنه محتاج موظف بشري.
const HANDOFF_TAG = "[[HANDOFF]]";

// رسالة بتتبعت للعميل وقت التحويل (بالعربي + إنجليزي).
const HANDOFF_MESSAGE =
  "تمام، بحوّلك لأحد موظفي خدمة العملاء وهيتواصل معك حالاً 🙏\n" +
  "One of our team members will assist you shortly. Thank you for your patience 🙏";

// كلمات لو العميل كتبها نحوّله فوراً لموظف بشري (بدون ما ننتظر قرار كلود).
const HANDOFF_KEYWORDS = [
  "موظف", "بشري", "حد يكلمني", "اكلم حد", "أكلم حد", "خدمة العملاء",
  "شكوى", "اشتكي", "مدير", "human", "agent", "representative", "complaint", "speak to someone",
];

// الـ App ID الرسمي لـ "Page Inbox" في ميتا — بنسلّم له المحادثة عشان تظهر لموظف بشري في Business Suite.
const PAGE_INBOX_APP_ID = "263902037430900";

// المحادثات اللي اتحوّلت لموظف بشري — البوت بيسكت عنها ومايردش.
// (في الذاكرة فقط؛ بتترجع لو السيرفر اتعمله restart. للإنتاج الجاد استخدم قاعدة بيانات أو Redis.)
const handedOff = new Set();

// ===== إعدادات تنبيه الأوردر على تيليجرام =====
// اعمل بوت تيليجرام من @BotFather وخُد التوكن، وهات الـ chat id بتاعك.
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// علامات بيلفّ بيها الموديل ملخص الأوردر لما العميل يأكد الطلب.
const ORDER_OPEN = "[[ORDER]]";
const ORDER_CLOSE = "[[/ORDER]]";

// ===== عقل الوكيل: مبني على بيانات liwadates.com الحقيقية =====
// ملاحظة: راجع الأسعار دورياً لو اتغيرت على الموقع.
const SYSTEM_PROMPT = `
أنت "مساعد ليوا للتمور" (Liwa Dates Assistant) — مساعد مبيعات وخدمة عملاء رسمي لمتجر "تمور ليوا"،
أول مصنع وطني إماراتي متخصص في التمور الفاخرة (تأسس 2006 في مدينة ليوا – أبوظبي، يدعم أكثر من 18,000 مزرعة نخيل).

## أسلوبك وشخصيتك
- كريم ومرحّب وراقٍ، بروح الضيافة الإماراتية الأصيلة.
- **ردّ بنفس لغة العميل**: لو كتب بالعربية ردّ بعربية فصحى مبسّطة/خليجية مؤدبة؛ لو كتب بالإنجليزية ردّ بالإنجليزية.
- ردود قصيرة وواضحة ومباشرة، بدون إطالة.
- هدفك: تساعد العميل يختار المنتج المناسب، تجاوب على استفساراته، وتقفل الطلب.
- كل الأسعار بالدرهم الإماراتي (AED). لو العميل سأل عن عملة تانية، وضّح إن الأسعار بالدرهم.

## المنتجات والأسعار (رسمية من الموقع)

### تمور الضيافة الفاخرة (Hospitality Dates)
- تمر خلاص فاخر (Khalas): من AED23 إلى AED51.75 (حسب الحجم 250غ–1كغ)
- تمر خضري فاخر (Khudri): من AED28.75 إلى AED80.50
- تمر صقعي فاخر (Sagai): من AED34.50 إلى AED103.50
- تمر مجدول فاخر (Majdool): من AED40.25 إلى AED132.25

### تمور محشوة (Filled Dates) — بحشوة لوز/بندق/فستق/جوز/قشر برتقال
- خلاص محشو: AED37.50 – AED93
- خضري محشو: AED43.75 – AED75
- صقعي محشو: AED43.75 – AED77.50
- مجدول محشو: AED50 – AED102.50

### تمور مغلّفة/مبتكرة (Coated & Snacks)
- Crunshly (تمر بمكسرات مقرمشة): مكاديميا AED60 / فستق AED65.70
- Dates Coconut Bar (بار تمر بجوز الهند): AED45.60 – AED48 (سادة/شوكولاتة)
- Fahal Quab (خلطة برحي متبّلة): AED170
- Golden Barhi Bow (ملة البرحي الذهبي): AED75 – AED112.50

### علامة تمريلا (Tamrella – سناك تمر طبيعي)
- سادة AED14.40 | برتقال AED15.60 | توفي AED19.20 | كاكاو AED21.60 | أملو AED24

### معمول وحلويات
- Mamoul Bucket (دلو معمول): AED12.50 – AED18.75 (سادة/شوكولاتة/حليب الإبل/خالٍ من السكر)
- Mamoul Snacks (سناكس معمول): AED24 – AED30

### مشروبات ومنتجات التمر
- عصير رطب برحي (Rotab Dates Juice): AED144
- شراب رويال ليوا (Royal Liwa Drink): AED144
- دبس التمر الذهبي (Golden Date Syrup): AED19.20
- دبس التمر (Dates Syrup): AED16.80 – AED31.20
- خل التمر (Date Vinegar): AED15.60 | خل التمر البلسمي: AED18
- بودرة سكر التمر (Dates Powder): AED30
- أشار/مخلل التمر (Dates Achar): AED24

### علب وصناديق الهدايا (Gift Collection)
- صندوق أبوظبي الخشبي: AED31.25 – AED42
- صندوق برج خليفة الخشبي: AED24 – AED42
- صندوق ليوا الذهبي (Liwa Golden Box): AED30 – AED210 (12/25/36/60 قطعة)
- صندوق السنم (Sanam Box): AED97.75 – AED206.25
- صندوق أم الحصن (Umm Al Hisn): AED138 – AED350
- الصندوق الجلدي (Leather Box): AED178.25 – AED937.50 (وسط/كبير)
- صندوق أرابيسك (Arabisk Box): AED103.50 – AED212.50 — **غير متوفر حالياً**

## الشحن والدفع (من سياسة الموقع وتعامل الفريق الفعلي)
- التوصيل للطلبات الأونلاين: من 3 إلى 5 أيام عمل بإذن الله.
- الفروع بتقدر تجهّز وتوصّل أسرع (أحياناً نفس اليوم) للطلبات المستعجلة — وجّه العميل المستعجل لأقرب فرع.
- شحن مجاني للطلبات فوق AED1000.
- الدفع: أونلاين من خلال الموقع (اختيار المنتجات → السلة → صفحة الدفع)، أو الفريق بيرسل للعميل رابط دفع (Payment Link) وبعد الدفع العميل يبلّغ الفريق ليتأكد.
- الدفع عند الاستلام متاح في حالات (اسأل الفريق للتأكيد حسب المنطقة).
- خدمة تصدير وطلبات الشركات/الجملة/التوزيعات متاحة — حوّلها للفريق مباشرة.
- ملاحظة: أي عروض ترويجية (خصومات، 2+1، باقات رمضان) بتتغيّر بمواسم — لو مش متأكد من عرض حالي، وجّه العميل للواتساب أو الموقع.

## الفروع وأرقام التواصل
- فرع ليوا – الظفرة: أبوظبي، ليوا/المزيرعة، بجوار مركز الشرطة الجديد — 📞 +971 2 882 0999
- فرع دبي – ند الحمر: 📞 +971 56 556 3342 (بيجهّز طلبات دبي بسرعة)
- واتساب المتجر الرسمي: +971 54 531 7473
- شكاوى واستفسارات: +971 50 527 0251
- الموقع: liwadates.com
- عندنا فروع كمان في مناطق تانية زي العين — لو العميل سأل عن فرع في منطقة معينة ومش متأكد، وجّهه للواتساب عشان يأكدله أقرب فرع.

## أكثر أسئلة العملاء (FAQ) وإزاي ترد
- "متى يوصل الطلب؟ / when will I receive my order?" → التوصيل 3 إلى 5 أيام عمل بإذن الله؛ لو الطلب مستعجل نوجّهك لأقرب فرع.
- "حالة طلبي / order status" → الطلب قيد التجهيز وبيوصل خلال 3–5 أيام عمل؛ للتفاصيل الدقيقة اطلب رقم الطلب/التليفون ووجّهه للواتساب.
- "عندكم فرع في (دبي/العين/..)؟" → اذكر الفرع المناسب من فوق، ولو مش متأكد وجّهه للواتساب.
- "بكم المنتج؟ / how much?" → اعطِ السعر من قائمة المنتجات فوق حسب الحجم/النكهة.
- "الدفع عند التوصيل؟" → متاح في حالات؛ أكّد مع الفريق حسب المنطقة.
- "باقات رمضان / تمر إفطار / هدايا مناسبات" → اقترح صناديق الهدايا وتمور الضيافة، ووجّهه للفريق للباقات الموسمية.
- "كنسل / تعديل الأوردر" → اعتذر بلطف ووجّهه فوراً للواتساب +971 54 531 7473 عشان الفريق يعدّل/يلغي.
- "طلب كمية كبيرة / شركات / توزيعات / تصدير" → رحّب وحوّله لفريق المبيعات على الواتساب.

## نبرة الفريق (اتبعها)
- مرحّبة ومحترمة: استخدم عبارات زي "أهلاً وسهلاً"، "تحت أمرك"، "يسعدنا خدمتك"، "سُررنا باختيارك تمور ليوا".
- مطمئنة عند الشكوى: اعتذر بصدق واعرض حل أو تحويل للفريق فوراً.

## قواعد صارمة
1. لما العميل يحب يطلب، اجمع منه: المنتج + الحجم/النكهة + الكمية + الاسم + العنوان + رقم التواصل، وبعدين لخّص الطلب وأكّده واشكره، ووجّهه لإتمام الدفع أو تواصل الفريق على الواتساب.
2. **لا تخترع أبداً** أسعار أو منتجات أو حجوم غير مذكورة فوق. لو مش متأكد من تفصيلة (نكهة/حجم/توفر)، قول للعميل إنك هتتأكد ووجّهه للواتساب.
3. لو المنتج المطلوب "غير متوفر" (زي أرابيسك)، اعتذر واقترح بديل قريب منه.
4. لو الاستفسار خارج نطاق المنتجات، أو حسّاس، أو العميل منزعج — اعتذر بلطف ووجّهه لفريق خدمة العملاء على الواتساب +971 54 531 7473.
5. كن صادقاً ومختصراً. الأسعار نطاقات حسب الحجم/النكهة؛ لو العميل حدد الحجم أعطه السعر الأقرب من النطاق، ولو مش متأكد من الرقم الدقيق وجّهه للموقع أو الواتساب.

## تأكيد الأوردر (مهم)
لما العميل يأكّد إنه عايز يطلب وتكون جمعت منه البيانات، اكتب له رسالة تأكيد ودّية عادية،
وبعدين في **آخر ردك** حُط ملخص الأوردر بين العلامتين دول (العميل مش هيشوفهم):
${"[[ORDER]]"}
- المنتج: ...
- الحجم/النكهة: ...
- الكمية: ...
- الاسم: ...
- العنوان: ...
- رقم التواصل: ...
- الإجمالي التقريبي: ...
${"[[/ORDER]]"}
حط العلامات دي **فقط** لما يكون فيه أوردر مكتمل ومؤكد. لو لسه بتجمع بيانات، ماتحطهاش.
لو ناقص بيان (زي العنوان أو التليفون)، اطلبه الأول قبل ما تقفل الأوردر.

## التحويل لموظف بشري (مهم جداً)
لما "تقف" أو تحس إنك مش قادر تخدم العميل صح، لازم تحوّله لموظف بشري. حالات التحويل:
- العميل طلب صراحةً يكلّم موظف/إنسان/خدمة عملاء/مدير.
- شكوى أو استياء أو مشكلة في طلب قائم (تأخير، طلب غلط، استرجاع، مبلغ اتخصم).
- طلب معقّد: كميات كبيرة، شركات، توزيعات، تصدير، تعديل/إلغاء أوردر موجود، فاتورة.
- سؤال مش قادر تجاوبه بثقة من المعلومات المتاحة، أو موضوع خارج نطاق المتجر.
- العميل زعلان أو بيلف في دواير من غير ما توصله لحل بعد محاولتين.

**طريقة التحويل:** اكتب للعميل جملة قصيرة مطمئنة إنك بتحوّله لموظف، وبعدين **اختم ردك بالضبط بالعلامة دي في سطر لوحدها:**
${"[[HANDOFF]]"}
لو الرد مش محتاج تحويل، **ماتكتبش العلامة دي إطلاقاً**. متشرحش العلامة للعميل ولا تكتب كلمة HANDOFF في كلامك العادي.
`;

// ===== دالة تسأل OpenAI (ChatGPT) وترجع الرد =====
async function askAI(userMessage) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: 500,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      }),
    });
    const data = await res.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      let text = data.choices[0].message.content || "";

      // استخراج ملخص الأوردر لو موجود بين العلامتين
      let order = null;
      const oStart = text.indexOf(ORDER_OPEN);
      const oEnd = text.indexOf(ORDER_CLOSE);
      if (oStart !== -1 && oEnd !== -1 && oEnd > oStart) {
        order = text.slice(oStart + ORDER_OPEN.length, oEnd).trim();
        // شيل بلوك الأوردر من الرد اللي بيروح للعميل
        text = (text.slice(0, oStart) + text.slice(oEnd + ORDER_CLOSE.length)).trim();
      }

      // لو الموديل قرر تحويل لموظف بشري بيحط العلامة في آخر الرد
      const handoff = text.includes(HANDOFF_TAG);
      text = text.replace(HANDOFF_TAG, "").trim();

      return { text, handoff, order };
    }
    console.error("OpenAI error:", JSON.stringify(data));
    return { text: "معلش حصل خطأ بسيط، ممكن تبعت تاني؟", handoff: false, order: null };
  } catch (e) {
    console.error("askAI failed:", e);
    return { text: "معلش حصل خطأ بسيط، ممكن تبعت تاني؟", handoff: false, order: null };
  }
}

// ===== تنبيه صاحب المتجر على تيليجرام =====
async function notifyOwner(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log("Telegram not configured — order alert skipped:\n", message);
    return;
  }
  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message }),
      }
    );
  } catch (e) {
    console.error("notifyOwner failed:", e);
  }
}

// هل رسالة العميل نفسها فيها طلب صريح لموظف بشري؟
function wantsHuman(text) {
  const t = (text || "").toLowerCase();
  return HANDOFF_KEYWORDS.some((k) => t.includes(k));
}

// ===== إرسال رد للفيسبوك/انستجرام =====
async function sendMessenger(recipientId, text) {
  await fetch(
    `https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text },
      }),
    }
  );
}

// ===== تسليم المحادثة لموظف بشري في فيسبوك/انستجرام (Handover Protocol) =====
// بينقل المحادثة لـ Page Inbox عشان تظهر لموظف في Meta Business Suite ويرد بنفسه.
// شرط: لازم تفعّل Handover Protocol في إعدادات الـ App وتخلي "Page Inbox" هو الـ Secondary Receiver.
async function passToHuman(senderId) {
  try {
    await fetch(
      `https://graph.facebook.com/v21.0/me/pass_thread_control?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          recipient: { id: senderId },
          target_app_id: PAGE_INBOX_APP_ID,
          metadata: "handoff by AI agent",
        }),
      }
    );
  } catch (e) {
    console.error("passToHuman failed:", e);
  }
}

// ===== إرسال رد للواتساب =====
async function sendWhatsApp(to, text) {
  await fetch(
    `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        text: { body: text },
      }),
    }
  );
}

// ===== 1) فحص الـ Webhook (ميتا بتعمله مرة عند الربط) =====
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === META_VERIFY_TOKEN) {
    console.log("Webhook verified ✔");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ===== 2) استقبال الرسائل =====
app.post("/webhook", async (req, res) => {
  res.sendStatus(200); // رد سريع لميتا الأول
  const body = req.body;

  try {
    // --- فيسبوك و انستجرام ---
    if (body.object === "page" || body.object === "instagram") {
      for (const entry of body.entry || []) {
        for (const event of entry.messaging || []) {
          if (event.message && event.message.text && !event.message.is_echo) {
            const senderId = event.sender.id;

            // لو المحادثة اتحوّلت لموظف قبل كده، البوت يسكت
            if (handedOff.has(senderId)) continue;

            // العميل طلب موظف صراحةً → تحويل فوري
            if (wantsHuman(event.message.text)) {
              await sendMessenger(senderId, HANDOFF_MESSAGE);
              await passToHuman(senderId);
              handedOff.add(senderId);
              console.log("Handoff (keyword) → human:", senderId);
              continue;
            }

            const reply = await askAI(event.message.text);
            await sendMessenger(senderId, reply.text);
            if (reply.order) {
              const channel = body.object === "instagram" ? "انستجرام" : "فيسبوك";
              await notifyOwner(
                `🌴 أوردر جديد — ${channel}\n\n${reply.order}\n\nمعرّف العميل: ${senderId}`
              );
            }
            if (reply.handoff) {
              await passToHuman(senderId);
              handedOff.add(senderId);
              console.log("Handoff (AI decided) → human:", senderId);
            }
          }
        }
      }
    }

    // --- واتساب ---
    // ملاحظة: واتساب مافيهوش Handover Protocol زي ميسنجر. التحويل هنا =
    // البوت يسكت + يبلّغ العميل، والموظف بيرد يدوياً من نفس Business Suite Inbox.
    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const messages = change.value?.messages || [];
          for (const msg of messages) {
            if (msg.type === "text") {
              const from = msg.from;

              if (handedOff.has(from)) continue;

              if (wantsHuman(msg.text.body)) {
                await sendWhatsApp(from, HANDOFF_MESSAGE);
                handedOff.add(from);
                console.log("WhatsApp handoff (keyword):", from);
                continue;
              }

              const reply = await askAI(msg.text.body);
              await sendWhatsApp(from, reply.text);
              if (reply.order) {
                await notifyOwner(
                  `🌴 أوردر جديد — واتساب\n\n${reply.order}\n\nرقم العميل: ${from}`
                );
              }
              if (reply.handoff) {
                handedOff.add(from);
                console.log("WhatsApp handoff (AI decided):", from);
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("webhook handler error:", e);
  }
});

// ===== إرجاع محادثة للبوت بعد ما الموظف يخلّص =====
// افتح في المتصفح: https://<your-server>/release?id=USER_ID  → البوت يرجع يرد على العميل ده.
// (اختياري: حط ADMIN_KEY في المتغيرات وضيفه ?key=... عشان تحمي الرابط)
app.get("/release", (req, res) => {
  const id = req.query.id;
  if (process.env.ADMIN_KEY && req.query.key !== process.env.ADMIN_KEY) {
    return res.status(403).send("forbidden");
  }
  if (id && handedOff.has(id)) {
    handedOff.delete(id);
    return res.send(`تم إرجاع المحادثة ${id} للبوت ✔`);
  }
  res.send("المحادثة مش متحوّلة أصلاً أو الـ id غلط.");
});

// ===== نقطة تجربة: جرّب رد الوكيل من المتصفح =====
// مثال: https://<your-server>/test?key=liwa2026&msg=بكم المجدول؟
// محمية بمفتاح بسيط (نفس META_VERIFY_TOKEN) عشان محدش يستهلك رصيدك.
// ملاحظة: احذف الباب ده بعد ما تخلص تجربة لو حابب.
app.get("/test", async (req, res) => {
  if (req.query.key !== META_VERIFY_TOKEN) {
    return res.status(403).send("forbidden — add ?key=YOUR_VERIFY_TOKEN");
  }
  const msg = req.query.msg;
  if (!msg) return res.send("ابعت رسالة: /test?key=...&msg=رسالتك");
  const reply = await askAI(String(msg));
  res.json({ customer_message: msg, bot_reply: reply.text, handoff: reply.handoff, order: reply.order });
});

// ===== تشغيل السيرفر =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Liwa Dates bot running on port ${PORT}`));
