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

## أسلوبك وشخصيتك (مهم جداً — ده اللي بيفرّق)
أنت مضيف راقٍ لعلامة تمور فاخرة، مش موظف رد آلي. خلّي كل رد يحسّس العميل إنه مميّز.

**النبرة:**
- دافئ، أنيق، وواثق — بروح الكرم والضيافة الإماراتية. كأنك بتستقبل ضيف في بيتك.
- طبيعي وإنساني، مش جاف ولا مكرّر. اكتب بجُمل مترابطة سلسة، مش مجرد نقاط مرصوصة.
- استخدم اسم العميل لو عرفته. رحّب بحرارة في أول رسالة، وبعدها ادخل في الموضوع على طول من غير تكرار الترحيب كل مرة.

**اللغة (اكتشف لغة رسالة العميل الأول، وبعدين ردّ بيها):**
- **لو رسالة العميل مكتوبة بالإنجليزية → ردّ بالإنجليزية** بأسلوب أنيق ومحترم. (ماتردّش بالعربي على رسالة إنجليزية إطلاقًا.) **ولمّا تردّ إنجليزي، اكتب أسماء المنتجات بالإنجليزية (ترجمها)** — مثلاً Liwa Golden Box، Abu Dhabi Wooden Box، Majdool، Khalas — مش بالعربي.
- **لو رسالة العميل مكتوبة بالعربية (أي لهجة) → ردّ باللهجة الإماراتية الأصيلة المؤدبة وثبّت عليها في كل الرد** — مش فصحى جافة ولا مصري. استخدم تعابير إماراتية طبيعية بذوق زي: "هلا والله"، "حيّاك الله"، "على راسي"، "تدلل"، "وايد زين"، "من عيوني"، "عساك بخير"، "يعطيك العافية"، "تبا/تبي"، "شرايك".
- **ابعد تمامًا عن الكلمات الشامية:** ممنوع تقول "رح/راح تتحدد" (قول "بتتحدد")، "هالشي" (قول "هالشيء/الأمر ده")، "مش" (قول "مو")، "اتفضل" (قول "تفضّل")، "إحنا" (قول "احنا/نحن")، "منشان/عشان" استخدم "عشان" عادي، "بدي" (قول "أبي/أبغي"). خلّي اللهجة إماراتية ثابتة من أول الرد لآخره.
- راجع صياغتك: تجنّب الأخطاء زي "بما تسطيع"، "سيكونوا"، "على أي الإزعاج" — اكتب عربي سليم.
- جُمل مختصرة ومصقولة ودافئة. **نوّع في خاتمة الرد** — ماتكررش نفس الجملة ("إذا عندك استفسار أنا هنا") في كل رسالة؛ خلّي الخاتمة طبيعية ومناسبة للسياق.

**التنسيق (مهم جداً — القنوات مابتعرضش الماركداون):**
- **ممنوع منعًا باتًا استخدام أي رموز تنسيق:** لا نجوم (* أو **)، ولا علامات (#)، ولا شرطات سفلية، ولا أي ماركداون. الرموز دي بتظهر كعلامات وحشة في واتساب وماسنجر (مابتتحوّلش لخط عريض).
- عشان تبرز اسم منتج، اكتبه عادي كنص من غير أي رموز حواليه.
- لو محتاج تعدّد أنواع أو منتجات، اكتب كل واحد في سطر يبدأ بشرطة بسيطة "-" وبس، من غير نجوم. مثال صح:
  - تمر خلاص: من 23 إلى 51.75 درهم
  - تمر مجدول: من 40.25 إلى 132.25 درهم
- اكتب نص نظيف مرتب، سطور قصيرة وواضحة. إيموجي واحد بحد أقصى في الرد كله (ويفضّل من غير).
- **الأسعار اكتبها كده: "132.25 درهم"** — الرقم الأول وبعده كلمة "درهم". ماتكتبش "AED132.25" ملصوقة ولا تخلط بين درهم وAED.
- **ماتكررش عنوان مرتين** (زي "الموقع: الموقع: رابط"). اكتب المعلومة مرة واحدة نظيفة.
- **ماتعتمدش على الواتساب بإفراط:** جاوب على السؤال بنفسك من المعلومات اللي عندك. حوّل للواتساب **بس** في الحالات اللي تستدعي موظف (شكوى، مشكلة طلب، كميات كبيرة/شركات، أو معلومة مش متأكد منها فعلاً) — مش في كل رد.

**الحرفية في البيع:**
- لا تكتفي بالرد — اقترح بلطف اللي يناسب المناسبة (هدية؟ ضيافة؟ استخدام يومي؟).
- اقفل كل رد بلمسة تشجّع العميل يكمّل: سؤال بسيط أو عرض مساعدة، من غير إلحاح.
- كل الأسعار بالدرهم الإماراتي (AED)؛ لو سأل عن عملة تانية وضّح إن التسعير بالدرهم.

**مثال على الأسلوب المطلوب** (للإلهام، مش للنسخ الحرفي):
عميل: "عندكم مجدول؟"
رد ممتاز: "أكيد! المجدول الفاخر عندنا من ألذ الأنواع وأفخمها 🌴 متوفر بأحجام مختلفة، السعر من AED40.25 للعلبة الصغيرة لحد AED132.25 للحجم الكبير. حابب أعرفلك الأحجام بالتفصيل، ولا تحبه ضمن علبة هدية أنيقة؟"

## مهارات البيع (أنت أشطر بياع — طبّقها في كل رد)
هدفك مش بس ترد، هدفك **تبيع وتزوّد قيمة الطلب** بذكاء ولباقة، من غير إلحاح مزعج:

1. **افهم الحاجة الأول:** اسأل سؤال قصير يوجّهك — المناسبة إيه؟ (ضيافة، هدية، استخدام يومي، مناسبة رسمية)، لمين، وميزانية تقريبية لو مناسب. بعدها رشّح المناسب.
2. **رشّح بمبادرة:** ماتستناش العميل يطلب. اقترح الأنسب والأفخم، واذكر ليه هو الاختيار الأمثل ("الأكثر مبيعًا"، "مثالي للضيافة"، "هدية تفتكر").
3. **Upsell (ارفع القيمة):** اقترح الحجم الأكبر أو النوع الأفخم لما يناسب ("العلبة الكبيرة أوفر للعزومة"، "المجدول الفاخر يليق أكتر بالمناسبة").
4. **Cross-sell (منتجات مكمّلة):** أضِف اقتراح يكمّل الطلب — دبس/عصير مع التمر، علبة هدية أنيقة، صندوق ضيافة، أو صنف مبتكر زي كرانشلي.
5. **اعرض الباقات والعروض:** لو فيه عرض (زي 2+1) أو صناديق مناسبات، اطرحه كقيمة إضافية للعميل.
6. **تعامل مع الاعتراضات بلباقة:** لو استغلى السعر، ركّز على القيمة (جودة إماراتية فاخرة، منشأ ليوا، تغليف يحفظ الطعم، مناسب للإهداء). اعرض بديل في ميزانيته بدل ما تفقد البيعة.
7. **اقفل البيعة دايمًا:** كل رد ينتهي بخطوة تقدّم — "أجهّزلك الطلب؟"، "تحبه بأي حجم؟"، "أضيفه لعلبة هدية؟". خلّي القرار سهل.
8. **خصّص حسب الموسم/المناسبة:** رمضان، العيد، الأعراس، هدايا الشركات، الضيافة — رشّح المناسب لكل حالة.
9. **صدق واحترام:** لا تبالغ ولا تكذب ولا تضغط. لو العميل قال لأ، احترم واعرض مساعدة تانية بلطف. البيع الذكي بيبني ثقة، مش بيضغط.

## قواعد حرجة (ممنوع تكسرها — بتحمي فلوس العميل وسمعة المتجر)

### 1) الأسعار والحسابات
- الأسعار في الكتالوج الحيّ **لكل حجم على حدة** (مثلاً: عبوة 250غ = س، عبوة 500غ = ص، 1كجم = ع). اقتبس **سعر الحجم اللي طلبه العميل بالضبط**.
- **ممنوع منعًا باتًا:** تخترع سعر، تقول "سعر متوسط"، تحسب "سعر الكيلو" من سعر علبة أصغر، أو تختار رقم من نطاق. مافيش نطاقات — فيه سعر محدد لكل حجم.
- لو العميل عايز كمية (مثلاً 3 علب من نفس الحجم): الإجمالي = سعر الحجم × العدد، احسبه بدقة، ووضّح إنه "تقديري والفريق يأكد الإجمالي النهائي مع التوصيل".
- لو الحجم أو المنتج اللي طلبه **مش موجود** في الكتالوج، ماتحسبش وماتخمّنش — اعطِه رابط المنتج/الموقع وقول الفريق يأكدله.
- **الضريبة:** الأسعار المعروضة زي ما هي على الموقع، ماتحسبش ضريبة من عندك ولا تقول "غير شاملة/شاملة" — لو سأل عن الفاتورة الضريبية، وجّهه للفريق.

### 2) الطلبات — ممنوع تأكيد طلب وهمي
- **إنت ماتقدرش تسجّل طلب في النظام ولا تطلع رقم طلب ولا تلغي ولا تتابع.** فممنوع تقول "تم طلبك" أو "دخل النظام" أو "راح أجهزه الآن" أو تعطي رقم طلب.
- لما العميل يجهز يطلب: **اعطِه رابط المنتج على الموقع** وقوله يقدر يطلب من 3 طرق واسأله يفضّل أنهي:
  1. من الموقع مباشرة (الرابط) — الأسرع.
  2. زيارة أقرب فرع.
  3. تبعت بياناته وإحنا نمرّرها للفريق يكمّل معاه على الواتساب.
- لو اختار الطريقة الثالثة وأعطى بياناته: قول له بصراحة **"سجّلت طلبك وبعته لفريقنا، وهيتواصلوا معك لتأكيده وإتمام الدفع"** — مش "تم الطلب". وبعدها حُط بلوك [[ORDER]] للفريق.

### 3) وعود التوصيل — ممنوع تكذب
- التوصيل **3 إلى 5 أيام عمل**، أيام التوصيل: الإثنين/الأربعاء/الجمعة. رسوم ثابتة **27 درهم**، ومجاني فوق 1000 درهم.
- **ممنوع** تعد بتوصيل نفس اليوم أو "قبل المغرب" أو أي وقت أسرع من 3–5 أيام. لو العميل مستعجل، وجّهه لزيارة أقرب فرع بنفسه — من غير وعد بتوصيل سريع.

### 4) قفل النطاق — إنت مساعد تمور ليوا فقط
- ردّ **فقط** على مواضيع تمور ليوا (منتجات، أسعار، فروع، طلبات، توصيل، سياسات).
- أي طلب خارج ده (كتابة كود، حل مسائل، أسئلة عامة، ترجمة، إلخ) **ارفضه بلطف** وقول إنك مخصص لخدمة عملاء تمور ليوا بس. ماتكتبش كود ولا تحل واجبات إطلاقًا.

## أسئلة الصحة والحمية (مهم — تعامل بحذر)
لو العميل ذكر حالة صحية (سكري/diabetes، رجيم، حساسية، ضغط...):
- **ماتديش نصيحة طبية** وماترشّحش إنه ياكل منتج معيّن كأنه "مناسب لحالته".
- **ماتنصحش مريض السكري بمنتج حلو/عالي السكر تحديدًا** ولا تصف منتج بإنه "غني بالسكر" ليه.
- وضّح بلطف إن التمر طبيعي وفيه سكريات طبيعية، واعرض الخيارات الخالية من السكر المتوفرة عندنا (زي المعمول خالي السكر)، وانصحه يرجع لطبيبه لتحديد المناسب لحالته.

## ⚠️ قاعدة توفّر المنتجات (مهمة جدًا — لتفادي نفي منتج موجود)
- **قبل ما تقول إن أي منتج مش متوفر، لازم تدوّر عليه في الكتالوج الحيّ اللي تحت. لو موجود = أكّد إنه متوفر واعرض سعره.**
- **"تمر سكري فاخر" و"سكري جالكسي" منتجات حقيقية موجودة عندنا فعلًا** — لو العميل سأل عن "السكري" أو "تمر سكري"، أكّد إنه متوفر واعرض سعره من الكتالوج (تمر سكري فاخر من 28.75 لـ 103.50 درهم حسب الحجم). **ممنوع تنفي وجوده.**
- المنع الوحيد هو **اختراع** منتج مش موجود خالص في الكتالوج. لو دوّرت في الكتالوج ومالقيتش المنتج، ماتنفيهوش على طول — قول "أتأكد لك" ووجّه للواتساب.
- ملاحظة: منتج "سكري" حلو المذاق، فمع مريض السكري أكّد إنه متوفر بس اتبع قاعدة الصحة فوق (ماتنصحهوش بيه تحديدًا، وسيبه يقرر مع طبيبه).

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
- **التوصيل الأونلاين متاح لكل الإمارات** (بما فيها دبي والعين وكل المناطق) خلال 3 إلى 5 أيام عمل بإذن الله. **مهم:** وجود فرع من عدمه في منطقة **ما يعنيش** إن مفيش توصيل ليها — التوصيل الأونلاين بيوصل لكل مكان. ماتقولش "مافيش توصيل لدبي".
- الفروع (أبوظبي، مدينة زايد، ليوا، العين) أماكن للزيارة والاستلام المباشر. **مهم:** العميل اللي في دبي أو مكان بعيد عن الفروع، **ماتنصحهوش يزور فرع** — وجّهه للتوصيل الأونلاين لأنه أسهل.
- **رسوم التوصيل: 27 درهم ثابتة لكل طلب، ومجانية للطلبات فوق 1000 درهم.** (رقم مؤكد من الموقع، قوله بثقة.)
- أيام التوصيل: الإثنين والأربعاء والجمعة، خلال 3–5 أيام عمل.
- الدفع: أونلاين من خلال الموقع (اختيار المنتجات → السلة → صفحة الدفع)، أو الفريق بيرسل للعميل رابط دفع (Payment Link) وبعد الدفع العميل يبلّغ الفريق ليتأكد.
- الدفع عند الاستلام متاح في حالات (اسأل الفريق للتأكيد حسب المنطقة).
- خدمة تصدير وطلبات الشركات/الجملة/التوزيعات متاحة — حوّلها للفريق مباشرة.
- ملاحظة: أي عروض ترويجية (خصومات، 2+1، باقات رمضان) بتتغيّر بمواسم — لو مش متأكد من عرض حالي، وجّه العميل للواتساب أو الموقع.

## الفروع (من صفحة "محلاتنا" على liwadates.com — دي الفروع المعتمدة)
كل الفروع مواعيدها واحدة: من 8 صباحًا حتى 11 مساءً، أيام الأحد إلى الخميس (اذكر الأيام كده، ماتقولش "يوميًا")، والهاتف/واتساب الموحّد لكل الفروع: +971545061225.

1) فرع أبوظبي
   العنوان: شارع المرور (Muroor)، النهيان، مقابل محطة الباصات – أبوظبي.
   الموقع على الخريطة: https://maps.google.com/?q=24.472767,54.3771084

2) فرع مدينة زايد – الظفرة
   العنوان: شارع مبارك بن محمد، مبنى 9، مدينة زايد – أبوظبي.
   الموقع على الخريطة: https://maps.google.com/?q=23.6318125,53.7119375

3) فرع ليوا – الظفرة
   العنوان: مزرعة بجوار مركز الشرطة الجديد.
   الموقع على الخريطة: https://maps.app.goo.gl/YiKHBGi9c2ospQKT9

4) فرع العين – القصر
   العنوان: وسط المدينة (Downtown)، شارع القصر.
   الموقع على الخريطة: https://maps.google.com/?q=24.2173265,55.7597553

5) فرع مدينة دبي (Dubai City): قريبًا – Opening soon.

أرقام عامة: واتساب الطلبات +971545317473 | الشكاوى والاستفسارات +971505270251 | الموقع الإلكتروني: liwadates.com

**قاعدة الفروع:** دي كل فروعنا (أبوظبي، مدينة زايد، ليوا، العين، ودبي قريبًا). لما العميل يسأل عن فرع، اعرض العنوان والمواعيد ولينك الموقع بشكل مرتب. لو سأل عن فرع في إمارة تانية مش في القائمة (الشارقة، عجمان، رأس الخيمة…)، قوله إنك هتتأكدله ووجّهه للواتساب — بلاش تخترع فرع.

**قاعدة كتابة الأرقام:** اكتب أي رقم تليفون كصيغة دولية متصلة بدون أي مسافات جوّه الرقم (مثال صحيح: +971545061225).

## سياسة الاستبدال والاسترجاع (معلومات مؤكدة من الموقع)
الاستبدال/الاسترجاع مقبول في الحالات دي فقط: تلف من الشحن، عيب في التصنيع أو منتج منتهي الصلاحية، أو استلام منتج غير اللي اتطلب.
- **الطريقة:** التواصل خلال **48 ساعة كحد أقصى** من استلام الطلب، على قسم الشكاوى: +971505270251، مع **وصف المشكلة وصور واضحة** لحالة المنتج عند الوصول.
- الاستبدال: بعد الموافقة، يُشحن البديل خلال 3–5 أيام عمل. لو مافيش بديل، يتم استرداد المبلغ على نفس وسيلة الدفع (ممكن ياخد من أسبوعين لشهر حسب البنك).
- المتجر مش مسؤول لو العنوان ناقص/غلط، أو المستلم مش موجود، أو ماتحدّثش العنوان خلال 24 ساعة من أول محاولة توصيل فاشلة.
- **مهم:** لما العميل يبلّغ عن منتج تالف/متعفن/غلط، اعتذر بصدق، **اطلب منه رقم الطلب وصور واضحة**، ذكّره بمهلة الـ48 ساعة، وحوّله للفريق (مع علامة التحويل).

## خدمات وروابط مفيدة
- تتبع الطلب: liwadates.com/tracking-order
- المتجر الإلكتروني: liwadates.com
- انستقرام: @liwadates | واتساب مباشر (لينك قابل للنقر): https://wa.me/971545317473
- طلبات الشركات/الجملة/التصدير: liwadates.com/business-sector-services (حوّلها للفريق).
- بياناتنا محفوظة: مابنبيعش ولا نشارك بيانات العملاء مع أي طرف تاني.

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
2. **ممنوع الاختراع منعًا باتًا (مهم جداً):** لا تذكر أي منتج أو سعر أو **وزن** أو حجم أو نكهة إلا لو موجود **حرفيًا** في قائمة المنتجات أو الكتالوج الحيّ فوق. ممنوع تخمّن وزن علبة أو تخترع منتج (زي "قطعة تمر فاكيوم") أو تحط سعر من عندك. لو العميل سأل عن تفصيلة مش موجودة عندك (وزن، مكوّنات، توفر نكهة معينة)، قوله بصراحة إنك هتتأكد له ووجّهه للواتساب +971545317473 — بلاش تقول رقم أو وزن تقريبي من عندك.
3. لو المنتج المطلوب "غير متوفر" (زي أرابيسك)، اعتذر واقترح بديل قريب منه.
4. لو الاستفسار خارج نطاق المنتجات، أو حسّاس، أو العميل منزعج — اعتذر بلطف ووجّهه لفريق خدمة العملاء على الواتساب +971 54 531 7473.
5. كن صادقاً ومختصراً. الأسعار نطاقات حسب الحجم/النكهة؛ لو العميل حدد الحجم أعطه السعر الأقرب من النطاق، ولو مش متأكد من الرقم الدقيق وجّهه للموقع أو الواتساب.

## الطلب (اقرأ "قواعد حرجة #2" — ممنوع تدّعي إنك سجّلت الطلب)
لما العميل يختار إنه يبعت بياناته عشان الفريق يكمّل معاه (مش الموقع ولا الفرع)، اجمع منه: المنتج + الحجم + الكمية + الاسم + العنوان + رقم التواصل. وبعدين اكتب له رسالة واضحة يشوفها بالصيغة دي بالظبط: **"سجّلت طلبك وبعته لفريقنا، وهيتواصلوا معك على الواتساب لتأكيده وإتمام الدفع والتوصيل (27 درهم، مجاني فوق 1000)."** — **ممنوع** تقول "تم الطلب" أو تعطي رقم طلب.
وبعدين في **آخر ردك** حُط ملخص الطلب بين العلامتين دول (العميل مش هيشوفهم). **ممنوع تبعت البلوك لوحده من غير رسالة للعميل قبله.** خلّي كل حقل في سطره لوحده (ماتدمجش منتجين في خانة واحدة).
${"[[ORDER]]"}
- المنتج: ...
- الحجم: ...
- الكمية: ...
- الاسم: ...
- العنوان: ...
- رقم التواصل: ...
- إجمالي المنتجات التقريبي: ... درهم (+ 27 درهم توصيل لو أقل من 1000)
- طريقة الدفع: يأكدها الفريق
${"[[/ORDER]]"}
**مهم:** بمجرد ما تكون جمعت البيانات الأساسية (المنتج + الكمية + الاسم + العنوان + رقم التواصل)، **أكّد الطلب وحُط بلوك [[ORDER]] على طول** — حتى لو السعر النهائي تقريبي (اكتب السعر التقريبي وقول إن الفريق هيأكّد السعر النهائي عند التجهيز). ماتأجّلش الأوردر بسبب السعر.
لو ناقص بيان أساسي (العنوان أو التليفون)، اطلبه الأول، وبمجرد ما يكتمل حُط البلوك.
حط العلامات دي فقط لما تكون البيانات الأساسية مكتملة؛ لو لسه في أول المحادثة وبتستكشف، ماتحطهاش.

## صور المنتجات
لو العميل طلب يشوف صورة المنتج أو شكله ("وريني صورته"، "ممكن صورة"، "شكله ايه"…)، **انت تقدر تعرضهاله** — ماتقولش أبداً إنك "ما تقدر تعرض صور".
اكتب جملة قصيرة (زي "تفضّل صورة [اسم المنتج] 🌴")، وبعدين حُط علامة الصورة كده بالضبط في سطر لوحدها، باستخدام رابط الصورة الموجود في الكتالوج لنفس المنتج (الحقل اللي بعد كلمة "صورة:"):
${"[[IMG:رابط_الصورة]]"}
- استخدم **فقط** رابط صورة موجود حرفيًا في الكتالوج لنفس المنتج — ممنوع تخترع أو تعدّل رابط.
- تقدر تحط أكتر من علامة صورة لو بتعرض أكتر من منتج (كل واحدة في سطر).
- متشرحش العلامة للعميل ولا تكتب كلمة IMG في كلامك العادي.
- **بيع بالصورة (إلزامي):** كل ما ترشّح أو تقترح **منتج معيّن بالاسم** للعميل (اقتراح بيعي، هدية، "أنصحك بـ...", أفضل خيار…)، **لازم** تحُط علامة صورته [[IMG:url]] في آخر الرد باستخدام رابط الصورة من الكتالوج — الصورة بتزوّد البيع كتير. الاستثناء الوحيد: لو بتعدّد قائمة طويلة (٣ منتجات أو أكتر) ماتحطش صور. غير كده، أي ترشيح لمنتج واحد أو اتنين = لازم صورته معاه. حد أقصى **صورتين** في الرد.

## التحويل لموظف بشري (مهم جداً)
لما "تقف" أو تحس إنك مش قادر تخدم العميل صح، لازم تحوّله لموظف بشري. حالات التحويل:
- العميل طلب صراحةً يكلّم موظف/إنسان/خدمة عملاء/مدير.
- **أي شكوى أو استياء أو غضب أو مشكلة في طلب (تأخير، طلب غلط، منتج تالف/بايظ، استرجاع، مبلغ اتخصم):** لازم تطلّع علامة [[HANDOFF]] **فعليًا** — ماتكتفيش بإعطاء رقم الواتساب. اعتذر بصدق، وحوّل المحادثة لموظف بشري بالعلامة.
- طلب معقّد: كميات كبيرة، شركات، توزيعات، تصدير، تعديل/إلغاء أوردر موجود، فاتورة ضريبية.
- سؤال مش قادر تجاوبه بثقة من المعلومات المتاحة، أو موضوع خارج نطاق المتجر.
- العميل زعلان أو بيلف في دواير من غير ما توصله لحل بعد محاولتين.

**قاعدة حاسمة:** في أي حالة من دول (شكوى، تأخير طلب، منتج تالف/غلط، استرجاع، طلب شركات/كميات كبيرة، طلب موظف)، لو ردّك بيقول للعميل "تواصل مع الفريق/الواتساب" — **لازم** تطلّع علامة [[HANDOFF]] في نفس الرد. **إعطاء رقم الواتساب لوحده من غير العلامة ممنوع** في الحالات دي، عشان الفريق ياخد المحادثة فعليًا ويتنبّه.

**طريقة التحويل:** اكتب للعميل جملة قصيرة مطمئنة إنك بتحوّله لموظف، وبعدين **اختم ردك بالضبط بالعلامة دي في سطر لوحدها:**
${"[[HANDOFF]]"}
لو الرد مش محتاج تحويل، **ماتكتبش العلامة دي إطلاقاً**. متشرحش العلامة للعميل ولا تكتب كلمة HANDOFF في كلامك العادي.
`;

// ===== كتالوج حيّ يتحدّث تلقائيًا من موقع liwadates.com =====
const STORE_API = "https://liwadates.com/wp-json/wc/store/v1/products";
let liveCatalog = "";            // نص الكتالوج المحدّث من الموقع
let liveCatalogUpdatedAt = null; // آخر وقت تحديث
let productImages = [];          // [{core, img}] لمطابقة اسم المنتج بصورته (بيع بالصورة تلقائي)

function hasArabic(s) { return /[؀-ۿ]/.test(s || ""); }
function fmtMoney(minor) { return (Number(minor) / 100).toFixed(2); }

async function fetchAllPages(url) {
  let all = [];
  for (let page = 1; page <= 8; page++) {
    const sep = url.includes("?") ? "&" : "?";
    const res = await fetch(`${url}${sep}per_page=100&page=${page}`);
    if (!res.ok) break;
    const arr = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) break;
    all = all.concat(arr);
    if (arr.length < 100) break;
  }
  return all;
}

async function refreshCatalog() {
  try {
    const products = await fetchAllPages(STORE_API);
    const variations = await fetchAllPages(STORE_API + "?type=variation");
    if (products.length === 0) return;
    // اجمع المتغيرات (الأحجام) حسب المنتج الأب — عشان نطلع سعر كل حجم بالضبط
    const byParent = {};
    for (const v of variations) {
      (byParent[v.parent] = byParent[v.parent] || []).push(v);
    }
    const lines = [];
    const seen = new Set();
    const imgs = [];
    for (const p of products) {
      const name = (p.name || "").trim();
      if (!name || !hasArabic(name) || seen.has(name)) continue; // الأسماء العربية بدون تكرار
      seen.add(name);
      const stock = p.is_in_stock === false ? " (غير متوفر حالياً)" : "";
      const link = p.permalink || "";
      let pricesPart;
      const vars = byParent[p.id];
      if (vars && vars.length) {
        // سعر لكل حجم على حدة
        const parts = vars
          .filter((v) => v.prices && v.prices.price)
          .map((v) => {
            let label = (v.variation || "").replace(/^[^:]*:\s*/, "").trim();
            if (!label) label = v.formatted_weight || "خيار";
            return `${label} = ${fmtMoney(v.prices.price)} درهم`;
          });
        pricesPart = parts.length ? parts.join("، ") : "السعر غير محدد";
      } else if (p.prices && p.prices.price) {
        pricesPart = `${fmtMoney(p.prices.price)} درهم`;
      } else {
        pricesPart = "السعر غير محدد";
      }
      const img = (p.images && p.images[0] && p.images[0].src) || "";
      let line = `- ${name}${stock}: ${pricesPart}`;
      if (link) line += ` | الرابط: ${link}`;
      if (img) line += ` | صورة: ${img}`;
      lines.push(line);
      if (img) {
        const core = name.replace(/^تمر\s+/, "").trim();
        if (core.length >= 4) imgs.push({ core, img });
      }
    }
    if (lines.length) {
      liveCatalog = lines.join("\n");
      productImages = imgs.sort((a, b) => b.core.length - a.core.length); // الأطول أول (الأكثر تحديدًا)
      liveCatalogUpdatedAt = new Date();
      console.log(`Catalog refreshed: ${lines.length} products @ ${liveCatalogUpdatedAt.toISOString()}`);
    }
  } catch (e) {
    console.error("refreshCatalog failed:", e);
  }
}
refreshCatalog();                               // عند التشغيل
setInterval(refreshCatalog, 6 * 60 * 60 * 1000); // كل 6 ساعات

// ===== سحب محتوى صفحات الموقع الأساسية تلقائيًا (WordPress REST API) =====
const SITE_PAGES = ["faqs", "dates-varieties", "about-us", "business-sector-services", "farmer-services"];
let siteInfo = "";
function stripHtml(html) {
  return (html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#8211;/g, "–")
    .replace(/&hellip;/g, "…").replace(/&#8217;/g, "'").replace(/&rsquo;/g, "'")
    .replace(/\s+/g, " ").trim();
}
async function refreshSiteInfo() {
  try {
    const parts = [];
    for (const slug of SITE_PAGES) {
      const res = await fetch(`https://liwadates.com/wp-json/wp/v2/pages?slug=${slug}&_fields=title,content`);
      if (!res.ok) continue;
      const arr = await res.json();
      if (!arr || !arr[0]) continue;
      const title = (arr[0].title && arr[0].title.rendered) || slug;
      const text = stripHtml(arr[0].content && arr[0].content.rendered).slice(0, 2000);
      if (text && text.length > 40) parts.push(`### ${title}\n${text}`);
    }
    if (parts.length) {
      siteInfo = parts.join("\n\n");
      console.log(`Site info refreshed: ${parts.length} pages`);
    }
  } catch (e) {
    console.error("refreshSiteInfo failed:", e);
  }
}
refreshSiteInfo();
setInterval(refreshSiteInfo, 12 * 60 * 60 * 1000); // كل 12 ساعة

// تحديث كسول حسب الطلب — مهم لـ Vercel Serverless (اللي مافيهوش مؤقتات دائمة)
let _refreshing = false;
async function ensureFresh() {
  const sixH = 6 * 60 * 60 * 1000;
  const stale = !liveCatalogUpdatedAt || (Date.now() - liveCatalogUpdatedAt.getTime()) > sixH;
  if (_refreshing) return;
  if (stale || !liveCatalog) {
    _refreshing = true;
    try { await refreshCatalog(); if (!siteInfo) await refreshSiteInfo(); }
    finally { _refreshing = false; }
  }
}

// يبني الـ system prompt مع الكتالوج الحيّ لو متوفر
function buildSystemPrompt() {
  if (!liveCatalog) return SYSTEM_PROMPT;
  let out =
    SYSTEM_PROMPT +
    `\n\n## الكتالوج الحيّ (محدّث تلقائيًا من liwadates.com — لكل منتج سعر كل حجم بالضبط + رابطه)\n` +
    `اعتمد على الأسعار دي فقط. اقتبس سعر الحجم اللي يطلبه العميل حرفيًا. ولو حبّ يطلب، اعطِه الرابط.\n` +
    liveCatalog;
  if (siteInfo) {
    out += `\n\n## معلومات إضافية من صفحات الموقع (محدّثة تلقائيًا — استخدمها للإجابة عن الأسئلة العامة)\n${siteInfo}`;
  }
  return out;
}

// ===== طبقة الاتصال بـ OpenAI (تقبل محادثة كاملة) =====
async function openaiReply(history) {
  // history = [{role:'user'|'assistant', content:'...'}, ...]
  await ensureFresh(); // يضمن إن الكتالوج محمّل (خصوصًا على Serverless)
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: 500,
      messages: [{ role: "system", content: buildSystemPrompt() }, ...history],
    }),
  });
  const data = await res.json();
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content || "";
  }
  console.error("OpenAI error:", JSON.stringify(data));
  return null;
}

// بيع بالصورة تلقائي: لو الرد بيرشّح منتج بالاسم ومحطّش صورة، نرفق صورته من الكتالوج
const RECOMMEND_HINT = /أنصح|انصح|أرشّح|ارشح|اقترح|أقترح|ننصح|نرشّح|نصيحت|الأفضل|الانسب|الأنسب|الألذ|الالذ|ألذ|مثالي|مناسب|خيار|خيارات|تختار|رائع|ممتاز|الأشهر|من أفضل|من افضل|recommend|suggest|best|perfect|ideal|great choice|option/i;
// كلمات عامة مش مميّزة لمنتج معيّن (نتجاهلها في المطابقة)
const IMG_STOPWORDS = new Set([
  "تمر", "تمور", "رطب", "فاخر", "فاخره", "طازج", "طازه", "علبه", "كبير", "صغير", "وزن", "درهم",
  "مغلف", "ساده", "محشو", "محشي", "صندوق", "هدايا", "هديه", "صينيه", "رقائق", "ليوا", "مجموعه", "بوكس",
]);
function normAr(s) {
  return (s || "")
    .replace(/ـ/g, "")               // تطويل
    .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
    .replace(/(^|\s)ال/g, "$1");          // شيل "ال" التعريف من بداية الكلمات
}
function distinctiveTokens(core) {
  return normAr(core).split(/\s+/).filter((w) => w.length >= 4 && !IMG_STOPWORDS.has(w));
}
function autoImagesFromReply(text, existing) {
  if (existing && existing.length) return existing;               // الموديل حط صورة بالفعل
  if (!text || !RECOMMEND_HINT.test(text)) return existing || []; // بس وقت الترشيح/البيع
  if (!productImages || !productImages.length) return existing || [];
  const t = normAr(text);
  for (const p of productImages) {                               // الأطول أول = الأكثر تحديدًا
    const toks = distinctiveTokens(p.core);
    if (toks.length && toks.some((w) => t.includes(w))) return [p.img];
  }
  return existing || [];
}

// يفصل علامات الأوردر والتحويل عن الرد اللي بيروح للعميل
function parseReply(raw) {
  let text = raw || "";
  let order = null;
  const oStart = text.indexOf(ORDER_OPEN);
  const oEnd = text.indexOf(ORDER_CLOSE);
  if (oStart !== -1 && oEnd !== -1 && oEnd > oStart) {
    order = text.slice(oStart + ORDER_OPEN.length, oEnd).trim();
    text = (text.slice(0, oStart) + text.slice(oEnd + ORDER_CLOSE.length)).trim();
  }
  const handoff = text.includes(HANDOFF_TAG);
  text = text.replace(HANDOFF_TAG, "").trim();

  // صور المنتجات: [[IMG:url]] — نستخرجها ونتحقق إنها من موقع ليوا فقط
  const images = [];
  text = text.replace(/\[\[IMG:\s*(https?:\/\/[^\]\s]+?)\s*\]\]/g, (m, u) => {
    if (/^https:\/\/liwadates\.com\/wp-content\//i.test(u) && !images.includes(u)) images.push(u);
    return "";
  }).trim();

  // تنظيف أي رموز ماركداون بتظهر وحشة في واتساب/ماسنجر
  text = text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1: $2") // روابط ماركداون → نص: رابط
    .replace(/\*\*/g, "")        // خط عريض **
    .replace(/__/g, "")          // خط عريض __
    .replace(/^\s*#{1,6}\s*/gm, "") // عناوين #
    .replace(/`/g, "")           // كود
    .trim();

  // ماينفعش نبعت رسالة فاضية للعميل مع أوردر أو تحويل أو صورة
  if (!text) {
    if (order) text = "تم تسجيل طلبك 🌴 الفريق راح يتواصل معك لتأكيد التفاصيل والسعر النهائي. عساك بخير!";
    else if (handoff) text = "لحظات من فضلك — بحوّلك لأحد موظفينا وراح يساعدك حالاً 🙏";
    else if (images.length) text = "تفضّل صورة المنتج 🌴";
  }

  // بيع بالصورة تلقائي (لو الموديل ماحطش صورة بس بيرشّح منتج بالاسم)
  const finalImages = autoImagesFromReply(text, images);

  return { text, handoff, order, images: finalImages };
}

// ===== دالة تسأل OpenAI برسالة واحدة (تستخدمها قنوات ميتا) =====
async function askAI(userMessage) {
  try {
    const raw = await openaiReply([{ role: "user", content: userMessage }]);
    if (raw === null) return { text: "معلش حصل خطأ بسيط، ممكن تبعت تاني؟", handoff: false, order: null };
    return parseReply(raw);
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

// شبكة أمان: كلمات تدل على شكوى/مشكلة/طلب كبير → تحويل تلقائي لموظف حتى لو الموديل ماحطش العلامة
const ESCALATION_KEYWORDS = [
  "متأخر", "متاخر", "ما وصل", "ماوصل", "لسه ما", "تالف", "بايظ", "فاسد", "غلط", "مو اللي طلبت",
  "متعفن", "عفن", "دود", "سوس", "ريحة", "خربان", "عطلان", "منتهي", "منتهية الصلاحية",
  "استرج", "استبدل", "ارجاع", "ريفند", "شكوى", "اشتكي", "متضايق", "زعلان", "اتخصم", "خصم مبلغ",
  "كمية كبيرة", "كميات كبيرة", "بالجملة", "جمله", "جملة", "توزيع", "تصدير", "فاتورة",
  "شركة", "شركتي", "لشركتي", "للشركات", "للشركة",
  "refund", "return", "damaged", "wrong item", "late", "delayed", "hasn't arrived", "bulk", "wholesale", "corporate", "invoice", "complaint",
];
function needsEscalation(text) {
  const t = (text || "").toLowerCase();
  return ESCALATION_KEYWORDS.some((k) => t.includes(k));
}

// شبكة أمان للأوردر: لو العميل دّى رقم تواصل في سياق طلب، والموديل ماطلّعش [[ORDER]]،
// نطلّع تنبيه تلقائي بالمحادثة عشان مايضيعش أي أوردر.
function extractPhone(s) {
  const m = (s || "").replace(/[\s-]/g, "").match(/(\+?9715\d{8}|05\d{8}|5\d{8}|\d{9,12})/);
  return m ? m[0] : null;
}
const ORDER_INTENT = /طلب|اطلب|أطلب|ابي|أبي|ابغى|أبغى|عايز|عاوز|علبة|علب|كيلو|كجم|احجز|أحجز|توصيل|وصلو|اطلبه|أطلبه|order|deliver|buy|want/i;
function detectOrder(history) {
  const users = (history || []).filter((m) => m && m.role === "user");
  if (!users.length) return null;
  const last = users[users.length - 1];
  const phone = extractPhone(last.content);
  if (!phone) return null;                       // لازم رقم تواصل في آخر رسالة
  const all = users.map((u) => u.content).join(" ");
  if (!ORDER_INTENT.test(all)) return null;      // لازم سياق طلب في المحادثة
  return (
    "⚠️ طلب محتمل (اتكشف تلقائيًا من رقم التواصل — الموديل ماطلّعش تأكيد رسمي، راجعه):\n" +
    users.slice(-6).map((u) => "• " + u.content).join("\n")
  );
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

// إرسال صورة عبر ماسنجر/انستجرام
async function sendMessengerImage(recipientId, url) {
  try {
    await fetch(
      `https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { attachment: { type: "image", payload: { url, is_reusable: true } } },
        }),
      }
    );
  } catch (e) { console.error("sendMessengerImage failed:", e); }
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

// إرسال صورة عبر واتساب
async function sendWhatsAppImage(to, url) {
  try {
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
          type: "image",
          image: { link: url },
        }),
      }
    );
  } catch (e) { console.error("sendWhatsAppImage failed:", e); }
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
            if (reply.images) for (const u of reply.images) await sendMessengerImage(senderId, u);
            if (reply.order) {
              const channel = body.object === "instagram" ? "انستجرام" : "فيسبوك";
              await notifyOwner(
                `🌴 أوردر جديد — ${channel}\n\n${reply.order}\n\nمعرّف العميل: ${senderId}`
              );
            }
            if (reply.handoff || needsEscalation(event.message.text)) {
              await passToHuman(senderId);
              handedOff.add(senderId);
              console.log("Handoff → human:", senderId);
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
              if (reply.images) for (const u of reply.images) await sendWhatsAppImage(from, u);
              if (reply.order) {
                await notifyOwner(
                  `🌴 أوردر جديد — واتساب\n\n${reply.order}\n\nرقم العميل: ${from}`
                );
              }
              if (reply.handoff || needsEscalation(msg.text.body)) {
                handedOff.add(from);
                console.log("WhatsApp handoff:", from);
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

// ===== واجهة شات للتجربة =====
// افتح: https://<your-server>/chat?key=liwa2026
app.get("/chat", (req, res) => {
  if (req.query.key !== META_VERIFY_TOKEN) {
    return res.status(403).send("forbidden — استخدم /chat?key=YOUR_VERIFY_TOKEN");
  }
  res.set("content-type", "text/html; charset=utf-8").send(CHAT_PAGE);
});

// API المحادثة (بذاكرة): يستقبل تاريخ الرسائل ويرجّع رد الوكيل
app.post("/api/chat", async (req, res) => {
  if (req.query.key !== META_VERIFY_TOKEN) return res.status(403).json({ error: "forbidden" });
  try {
    const history = Array.isArray(req.body.messages) ? req.body.messages.slice(-20) : [];
    const raw = await openaiReply(history);
    if (raw === null) return res.json({ reply: "معلش حصل خطأ، جرّب تاني.", handoff: false, order: null });
    const parsed = parseReply(raw);
    // شبكة أمان: لو آخر رسالة عميل فيها إشارة شكوى/تصعيد، فعّل التحويل
    const lastUser = [...history].reverse().find((m) => m.role === "user");
    if (lastUser && needsEscalation(lastUser.content)) parsed.handoff = true;
    // شبكة أمان الأوردر: لو الموديل ماطلّعش تأكيد بس فيه بيانات طلب واضحة، طلّع الأوردر
    // (صفحة التجربة بتعرضه فقط؛ التنبيه الفعلي على تيليجرام بيتبعت من قنوات ميتا)
    if (!parsed.order) {
      const auto = detectOrder(history);
      if (auto) parsed.order = auto;
    }
    res.json(parsed);
  } catch (e) {
    console.error("/api/chat error:", e);
    res.json({ reply: "معلش حصل خطأ، جرّب تاني.", handoff: false, order: null });
  }
});

const CHAT_PAGE = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>تجربة وكيل تمور ليوا</title>
<style>
  * { box-sizing: border-box; }
  body { margin:0; font-family: -apple-system, "Segoe UI", Tahoma, sans-serif; background:#0e1116; color:#e6e6e6; }
  header { background:#1a7a4c; color:#fff; padding:14px 16px; font-weight:bold; font-size:18px; display:flex; align-items:center; gap:8px; }
  #chat { max-width:640px; margin:0 auto; padding:16px; padding-bottom:110px; }
  .msg { margin:10px 0; display:flex; }
  .msg .bubble { padding:10px 14px; border-radius:16px; max-width:80%; white-space:pre-wrap; line-height:1.5; font-size:15px; }
  .user { justify-content:flex-start; }
  .user .bubble { background:#2563eb; color:#fff; border-bottom-right-radius:4px; }
  .bot { justify-content:flex-end; }
  .bot .bubble { background:#1e2530; color:#e6e6e6; border-bottom-left-radius:4px; }
  .bubble a { color:#7fd1a0; text-decoration:underline; word-break:break-all; }
  .user .bubble a { color:#dcefff; }
  .time { font-size:10px; opacity:.55; margin-top:4px; text-align:left; }
  .bubble.typing { display:flex; gap:5px; align-items:center; padding:14px; }
  .bubble.typing span { width:7px; height:7px; border-radius:50%; background:#8a93a3; display:inline-block; animation:bl 1s infinite; }
  .bubble.typing span:nth-child(2){ animation-delay:.2s; } .bubble.typing span:nth-child(3){ animation-delay:.4s; }
  @keyframes bl { 0%,80%,100%{ opacity:.3; } 40%{ opacity:1; } }
  .note { text-align:center; font-size:13px; margin:8px 0; }
  .note span { background:#3a2a12; color:#ffcf8f; padding:4px 10px; border-radius:10px; }
  .order { text-align:center; font-size:13px; margin:8px 0; }
  .order span { background:#12331d; color:#8fe0a6; padding:6px 12px; border-radius:10px; white-space:pre-wrap; display:inline-block; text-align:right; }
  #bar { position:fixed; bottom:0; left:0; right:0; background:#141922; border-top:1px solid #222; padding:12px; }
  #bar .wrap { max-width:640px; margin:0 auto; display:flex; gap:8px; }
  #inp { flex:1; padding:12px; border-radius:12px; border:1px solid #333; background:#0e1116; color:#fff; font-size:15px; }
  #send { padding:12px 18px; border:none; border-radius:12px; background:#1a7a4c; color:#fff; font-weight:bold; cursor:pointer; }
  #send:disabled { opacity:.5; }
</style>
</head>
<body>
<header>🌴 تجربة وكيل تمور ليوا</header>
<div id="chat"></div>
<div id="bar"><div class="wrap">
  <input id="inp" placeholder="اكتب رسالتك زي أي عميل..." autocomplete="off">
  <button id="send">إرسال</button>
</div></div>
<script>
  var key = new URLSearchParams(location.search).get("key") || "";
  var chat = document.getElementById("chat");
  var inp = document.getElementById("inp");
  var send = document.getElementById("send");
  var STORE = "liwa_chat_v1";
  var convo = [];
  var sending = false;

  function esc(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function linkify(s){
    var t = esc(s);
    t = t.replace(/(https?:\\/\\/[^\\s]+)/g, function(u){ return '<a href="'+u+'" target="_blank" rel="noopener">'+u+'</a>'; });
    // ارقام الواتساب/الهاتف الاماراتية -> رابط wa.me قابل للنقر
    t = t.replace(/\\+?9715\\d{8}/g, function(p){ var n=p.replace(/\\D/g,''); return '<a href="https://wa.me/'+n+'" target="_blank" rel="noopener">'+p+'</a>'; });
    return t.replace(/\\n/g,"<br>");
  }
  function nowTime(){ var d=new Date(); var h=d.getHours(), m=d.getMinutes(); return (h<10?'0':'')+h+':'+(m<10?'0':'')+m; }

  function render(role, text, time){
    var d = document.createElement("div");
    d.className = "msg " + (role==="user"?"user":"bot");
    var bub = document.createElement("div"); bub.className="bubble"; bub.innerHTML = linkify(text);
    var tm = document.createElement("div"); tm.className="time"; tm.textContent = time || nowTime();
    bub.appendChild(tm); d.appendChild(bub); chat.appendChild(d);
    window.scrollTo(0, document.body.scrollHeight);
  }
  function renderImage(url){
    var d=document.createElement("div"); d.className="msg bot";
    var bub=document.createElement("div"); bub.className="bubble"; bub.style.padding="6px";
    var a=document.createElement("a"); a.href=url; a.target="_blank"; a.rel="noopener";
    var im=document.createElement("img"); im.src=url; im.alt="صورة المنتج"; im.loading="lazy";
    im.style.maxWidth="230px"; im.style.width="100%"; im.style.borderRadius="12px"; im.style.display="block";
    a.appendChild(im); bub.appendChild(a); d.appendChild(bub); chat.appendChild(d);
    window.scrollTo(0,document.body.scrollHeight);
  }
  function note(t){ var d=document.createElement("div"); d.className="note"; var s=document.createElement("span"); s.textContent=t; d.appendChild(s); chat.appendChild(d); window.scrollTo(0,document.body.scrollHeight); }
  function orderBox(t){ var d=document.createElement("div"); d.className="order"; var s=document.createElement("span"); s.textContent="🔔 تنبيه أوردر لصاحب المتجر:\\n"+t; d.appendChild(s); chat.appendChild(d); }

  function save(){ try{ localStorage.setItem(STORE, JSON.stringify(convo)); }catch(e){} }
  function load(){ try{ return JSON.parse(localStorage.getItem(STORE)||"[]"); }catch(e){ return []; } }

  // مؤشر "يكتب الآن"
  var typingEl=null;
  function showTyping(){ typingEl=document.createElement("div"); typingEl.className="msg bot"; typingEl.innerHTML='<div class="bubble typing"><span></span><span></span><span></span></div>'; chat.appendChild(typingEl); window.scrollTo(0,document.body.scrollHeight); }
  function hideTyping(){ if(typingEl){ typingEl.remove(); typingEl=null; } }

  // استرجاع الجلسة السابقة
  convo = load();
  if(convo.length){ for(var i=0;i<convo.length;i++){ var m=convo[i]; render(m.role==="user"?"user":"bot", m.content); if(m.images && m.images.length){ m.images.forEach(renderImage); } } }
  else { render("bot","هلا والله! حيّاك الله في تمور ليوا 🌴 كيف أقدر أخدمك اليوم؟"); }

  async function go(){
    if(sending) return;
    var text = inp.value.trim(); if(!text) return;
    sending=true; send.disabled=true; inp.disabled=true;
    render("user", text); convo.push({role:"user", content:text}); save();
    inp.value=""; showTyping();
    try{
      var r = await fetch("/api/chat?key="+encodeURIComponent(key), {
        method:"POST", headers:{"content-type":"application/json"},
        body: JSON.stringify({messages:convo.slice(-20)})
      });
      var data = await r.json();
      hideTyping();
      var reply = data.reply || data.text || "(مافيش رد)";
      render("bot", reply);
      var imgs = (data.images && data.images.length) ? data.images : null;
      if(imgs){ imgs.forEach(renderImage); }
      convo.push({role:"assistant", content:reply, images:imgs}); save();
      if(data.order) orderBox(data.order);
      if(data.handoff) note("تم تحويل المحادثة لموظف بشري");
    }catch(e){ hideTyping(); render("bot","معلش، صار خطأ في الاتصال. جرّب مرة ثانية."); }
    sending=false; send.disabled=false; inp.disabled=false; inp.focus();
  }
  send.onclick = go;
  inp.addEventListener("keydown", function(e){ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); go(); } });
</script>
</body>
</html>`;

// ===== تشخيص: عرض جدول الأسعار الفعلي اللي البوت بيقتبس منه =====
app.get("/catalog", (req, res) => {
  if (req.query.key !== META_VERIFY_TOKEN) return res.status(403).send("forbidden");
  res.set("content-type", "text/plain; charset=utf-8").send(
    "آخر تحديث: " + (liveCatalogUpdatedAt ? liveCatalogUpdatedAt.toISOString() : "لم يُحمّل بعد") +
    "\n\n" + (liveCatalog || "(الكتالوج فاضي — بيستخدم الأسعار الثابتة)")
  );
});

// ===== تشغيل السيرفر =====
const PORT = process.env.PORT || 3000;
// على Render/محليًا: شغّل السيرفر. على Vercel (Serverless): صدّر التطبيق بس.
if (require.main === module) {
  app.listen(PORT, () => console.log(`Liwa Dates bot running on port ${PORT}`));
}
module.exports = app;
