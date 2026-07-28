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
- **لو رسالة العميل مكتوبة بالعربية (أي لهجة) → ردّ باللهجة الإماراتية الأصيلة المؤدبة** — مش فصحى ولا مصري. استخدم تعابير إماراتية طبيعية بذوق واعتدال زي: "هلا والله"، "حيّاك الله"، "على راسي"، "تدلل"، "وايد زين"، "من عيوني"، "عساك بخير"، "يعطيك العافية"، "تبا/تبي"، "شرايك" — من غير مبالغة ولا افتعال.
- جُمل مختصرة ومصقولة ودافئة، كل كلمة لها قيمة.

**التنسيق (مهم جداً — القنوات مابتعرضش الماركداون):**
- **ممنوع منعًا باتًا استخدام أي رموز تنسيق:** لا نجوم (* أو **)، ولا علامات (#)، ولا شرطات سفلية، ولا أي ماركداون. الرموز دي بتظهر كعلامات وحشة في واتساب وماسنجر (مابتتحوّلش لخط عريض).
- عشان تبرز اسم منتج، اكتبه عادي كنص من غير أي رموز حواليه.
- لو محتاج تعدّد أنواع أو منتجات، اكتب كل واحد في سطر يبدأ بشرطة بسيطة "-" وبس، من غير نجوم. مثال صح:
  - تمر خلاص: من 23 إلى 51.75 درهم
  - تمر مجدول: من 40.25 إلى 132.25 درهم
- اكتب نص نظيف مرتب، سطور قصيرة وواضحة. إيموجي واحد بحد أقصى في الرد كله (ويفضّل من غير).
- ابرز السعر بوضوح، من غير ما تغرق العميل بتفاصيل مش طالبها.

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

## أسئلة الصحة والحمية (مهم — تعامل بحذر)
لو العميل ذكر حالة صحية (سكري/diabetes، رجيم، حساسية، ضغط...):
- **ماتديش نصيحة طبية** وماترشّحش إنه ياكل منتج معيّن كأنه "مناسب لحالته".
- **ممنوع** تصف أي منتج بإنه "غني بالسكر" لمريض سكري، وممنوع تخترع أنواع مش في الكتالوج (زي "تمر السكري" أو غيره).
- وضّح بلطف إن التمر طبيعي وفيه سكريات طبيعية، واعرض الخيارات الخالية من السكر المتوفرة عندنا (زي المعمول خالي السكر)، وانصحه يرجع لطبيبه لتحديد المناسب لحالته.

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
- الفروع (مدينة زايد، أبوظبي، ليوا) أماكن للزيارة والاستلام المباشر، وبتقدر تجهّز أسرع للطلبات المستعجلة.
- شحن مجاني للطلبات فوق AED1000. أما رسوم التوصيل للطلبات الأقل، فبتتحدد عند إتمام الطلب على الموقع — لو العميل سأل عن الرقم بالضبط، وجّهه للموقع أو الواتساب بدل ما تقول رقم من عندك.
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

## سياسات وخدمات (للأسئلة الشائعة)
- الاسترجاع والاستبدال: متاح — التفاصيل على liwadates.com/exchange-and-return-policy، ولو حالة محددة (منتج تالف/غلط) حوّل العميل للفريق مع علامة التحويل.
- تتبع الطلب: من صفحة liwadates.com/tracking-order، ولو محتاج حالة طلب معيّن حوّله للفريق.
- الشحن والتوصيل: تفاصيل على liwadates.com/shipping-and-delivery — التوصيل 3–5 أيام عمل لكل الإمارات، مجاني فوق 1000 درهم.
- خدمة التصدير والطلبات التجارية: liwadates.com/business-sector-services (حوّل طلبات الشركات للفريق).

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

## تأكيد الأوردر (مهم)
لما العميل يأكّد إنه عايز يطلب وتكون جمعت منه البيانات، **لازم** تكتب له رسالة تأكيد ودّية واضحة يشوفها (تلخّص الطلب وتشكره وتقوله الفريق هيتواصل)،
وبعدين في **آخر ردك** حُط ملخص الأوردر بين العلامتين دول (العميل مش هيشوفهم). **ممنوع تبعت البلوك لوحده من غير رسالة للعميل قبله.**
${"[[ORDER]]"}
- المنتج: ...
- الحجم/النكهة: ...
- الكمية: ...
- الاسم: ...
- العنوان: ...
- رقم التواصل: ...
- الإجمالي التقريبي: ...
${"[[/ORDER]]"}
**مهم:** بمجرد ما تكون جمعت البيانات الأساسية (المنتج + الكمية + الاسم + العنوان + رقم التواصل)، **أكّد الطلب وحُط بلوك [[ORDER]] على طول** — حتى لو السعر النهائي تقريبي (اكتب السعر التقريبي وقول إن الفريق هيأكّد السعر النهائي عند التجهيز). ماتأجّلش الأوردر بسبب السعر.
لو ناقص بيان أساسي (العنوان أو التليفون)، اطلبه الأول، وبمجرد ما يكتمل حُط البلوك.
حط العلامات دي فقط لما تكون البيانات الأساسية مكتملة؛ لو لسه في أول المحادثة وبتستكشف، ماتحطهاش.

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

function hasArabic(s) { return /[؀-ۿ]/.test(s || ""); }
function fmtMoney(minor) { return (Number(minor) / 100).toFixed(2); }

async function refreshCatalog() {
  try {
    let all = [];
    for (let page = 1; page <= 6; page++) {
      const res = await fetch(`${STORE_API}?per_page=100&page=${page}`);
      if (!res.ok) break;
      const arr = await res.json();
      if (!Array.isArray(arr) || arr.length === 0) break;
      all = all.concat(arr);
      if (arr.length < 100) break;
    }
    if (all.length === 0) return;
    const lines = [];
    const seen = new Set();
    for (const p of all) {
      const name = (p.name || "").trim();
      if (!name || !hasArabic(name) || seen.has(name)) continue; // الأسماء العربية بدون تكرار
      seen.add(name);
      const pr = p.prices || {};
      let price;
      if (pr.price_range && pr.price_range.min_amount) {
        price = `${fmtMoney(pr.price_range.min_amount)} – ${fmtMoney(pr.price_range.max_amount)} درهم`;
      } else if (pr.price) {
        price = `${fmtMoney(pr.price)} درهم`;
      } else { price = "السعر غير محدد"; }
      const stock = p.is_in_stock === false ? " (غير متوفر حالياً)" : "";
      // الأحجام/الخيارات الحقيقية من الموقع (عشان مايخمّنش الأوزان)
      let opts = "";
      if (Array.isArray(p.attributes)) {
        const terms = [];
        for (const a of p.attributes) {
          if (Array.isArray(a.terms)) for (const t of a.terms) if (t && t.name) terms.push(t.name);
        }
        if (terms.length) opts = ` — الأحجام/الخيارات: ${terms.slice(0, 10).join("، ")}`;
      }
      lines.push(`- ${name}: ${price}${stock}${opts}`);
    }
    if (lines.length) {
      liveCatalog = lines.join("\n");
      liveCatalogUpdatedAt = new Date();
      console.log(`Catalog refreshed: ${lines.length} products @ ${liveCatalogUpdatedAt.toISOString()}`);
    }
  } catch (e) {
    console.error("refreshCatalog failed:", e);
  }
}
refreshCatalog();                               // عند التشغيل
setInterval(refreshCatalog, 6 * 60 * 60 * 1000); // كل 6 ساعات

// يبني الـ system prompt مع الكتالوج الحيّ لو متوفر
function buildSystemPrompt() {
  if (!liveCatalog) return SYSTEM_PROMPT;
  return (
    SYSTEM_PROMPT +
    `\n\n## الكتالوج الحيّ (محدّث تلقائيًا من liwadates.com — دي أحدث الأسعار، اعتمد عليها قبل أي سعر تاني):\n` +
    liveCatalog
  );
}

// ===== طبقة الاتصال بـ OpenAI (تقبل محادثة كاملة) =====
async function openaiReply(history) {
  // history = [{role:'user'|'assistant', content:'...'}, ...]
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

  // تنظيف أي رموز ماركداون بتظهر وحشة في واتساب/ماسنجر
  text = text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1: $2") // روابط ماركداون → نص: رابط
    .replace(/\*\*/g, "")        // خط عريض **
    .replace(/__/g, "")          // خط عريض __
    .replace(/^\s*#{1,6}\s*/gm, "") // عناوين #
    .replace(/`/g, "")           // كود
    .trim();

  // ماينفعش نبعت رسالة فاضية للعميل مع أوردر أو تحويل
  if (!text) {
    if (order) text = "تم تسجيل طلبك 🌴 الفريق راح يتواصل معك لتأكيد التفاصيل والسعر النهائي. عساك بخير!";
    else if (handoff) text = "لحظات من فضلك — بحوّلك لأحد موظفينا وراح يساعدك حالاً 🙏";
  }

  return { text, handoff, order };
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
  "متأخر", "متأخره", "ما وصل", "ماوصل", "لسه ما", "تالف", "بايظ", "فاسد", "غلط", "مو اللي طلبت",
  "استرجاع", "استبدال", "ريفند", "شكوى", "اشتكي", "متضايق", "زعلان", "اتخصم", "خصم مبلغ",
  "كمية كبيرة", "كميات كبيرة", "بالجملة", "جمله", "توزيع", "تصدير", "فاتورة", "شركتي", "لشركتي",
  "refund", "damaged", "wrong item", "late", "delayed", "hasn't arrived", "bulk", "wholesale", "corporate", "invoice", "complaint",
];
function needsEscalation(text) {
  const t = (text || "").toLowerCase();
  return ESCALATION_KEYWORDS.some((k) => t.includes(k));
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
  const key = new URLSearchParams(location.search).get("key") || "";
  const chat = document.getElementById("chat");
  const inp = document.getElementById("inp");
  const send = document.getElementById("send");
  let history = [];
  function add(role, text){
    const d = document.createElement("div");
    d.className = "msg " + (role==="user"?"user":"bot");
    d.innerHTML = '<div class="bubble"></div>';
    d.querySelector(".bubble").textContent = text;
    chat.appendChild(d); window.scrollTo(0, document.body.scrollHeight);
  }
  function note(t){ const d=document.createElement("div"); d.className="note"; d.innerHTML='<span></span>'; d.querySelector("span").textContent=t; chat.appendChild(d); }
  function orderBox(t){ const d=document.createElement("div"); d.className="order"; d.innerHTML='<span></span>'; d.querySelector("span").textContent="🔔 تنبيه أوردر لصاحب المتجر:\\n"+t; chat.appendChild(d); }
  add("bot","أهلاً وسهلاً في تمور ليوا 🌴 كيف أقدر أساعدك؟");
  async function go(){
    const text = inp.value.trim(); if(!text) return;
    add("user", text); history.push({role:"user", content:text});
    inp.value=""; send.disabled=true; inp.disabled=true;
    try{
      const r = await fetch("/api/chat?key="+encodeURIComponent(key), {
        method:"POST", headers:{"content-type":"application/json"},
        body: JSON.stringify({messages:history})
      });
      const data = await r.json();
      const reply = data.reply || data.text || "(مافيش رد)";
      add("bot", reply); history.push({role:"assistant", content:reply});
      if(data.order) orderBox(data.order);
      if(data.handoff) note("تم تحويل المحادثة لموظف بشري");
    }catch(e){ add("bot","خطأ في الاتصال."); }
    send.disabled=false; inp.disabled=false; inp.focus();
  }
  send.onclick = go;
  inp.addEventListener("keydown", e=>{ if(e.key==="Enter") go(); });
</script>
</body>
</html>`;

// ===== تشغيل السيرفر =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Liwa Dates bot running on port ${PORT}`));
