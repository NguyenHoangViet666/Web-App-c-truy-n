import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Feather, Globe, Shield, Heart, Award, Zap } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* HERO SECTION */}
      <div className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0">
            <img 
                src="https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                alt="Library Background" 
                className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fadeIn">
                Kết Nối Đam Mê <span className="text-blue-400">Light Novel</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                BetoBook là nền tảng đọc truyện trực tuyến dành cho giới trẻ, nơi hội tụ những bản dịch chất lượng và những tác phẩm sáng tác độc đáo.
            </p>
            <div className="flex justify-center gap-4">
                <Link to="/" className="px-8 py-3 bg-primary hover:bg-blue-600 text-white rounded-full font-bold transition-transform hover:scale-105 shadow-lg">
                    Khám phá ngay
                </Link>
                <Link to="/login" className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-full font-bold transition-all backdrop-blur-sm">
                    Tham gia cộng đồng
                </Link>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {[
                { label: 'Thành viên', val: '10,000+', icon: <Users className="w-6 h-6 text-blue-500"/> },
                { label: 'Đầu truyện', val: '500+', icon: <BookOpen className="w-6 h-6 text-green-500"/> },
                { label: 'Chương truyện', val: '25,000+', icon: <Zap className="w-6 h-6 text-yellow-500"/> },
                { label: 'Lượt đọc', val: '1M+', icon: <Heart className="w-6 h-6 text-red-500"/> },
            ].map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 text-center transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-center mb-3 bg-slate-50 w-12 h-12 items-center rounded-full mx-auto">{stat.icon}</div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">{stat.val}</div>
                    <div className="text-sm text-slate-500 uppercase tracking-wider font-medium">{stat.label}</div>
                </div>
            ))}
        </div>

        {/* MISSION & VISION */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6 relative inline-block">
                    Sứ mệnh của chúng tôi
                    <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-primary rounded-full"></span>
                </h2>
                <p className="text-slate-600 mb-6 leading-relaxed text-lg">
                    Chúng tôi tin rằng mỗi câu chuyện đều xứng đáng được kể và lắng nghe. BetoBook ra đời với mong muốn tạo ra một sân chơi công bằng, văn minh cho cả người đọc lẫn người sáng tạo nội dung.
                </p>
                <ul className="space-y-4">
                    {[
                        "Cung cấp trải nghiệm đọc mượt mà, không quảng cáo làm phiền.",
                        "Tôn trọng bản quyền và công sức của Dịch giả/Tác giả.",
                        "Xây dựng cộng đồng thảo luận văn minh, tích cực."
                    ].map((item, i) => (
                        <li key={i} className="flex items-start">
                            <div className="bg-blue-100 p-1 rounded-full mr-3 mt-1"><Award className="w-4 h-4 text-blue-600"/></div>
                            <span className="text-slate-700">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="relative">
                <div className="absolute top-4 left-4 w-full h-full bg-blue-100 rounded-2xl -z-10"></div>
                <img 
                    src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80" 
                    alt="Reading community" 
                    className="rounded-2xl shadow-xl w-full object-cover h-80"
                />
            </div>
        </div>

        {/* FEATURES / ROLES EXPLANATION */}
        <div className="mb-24">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Hệ sinh thái đa dạng</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">
                    Tại BetoBook, bạn có thể đóng góp theo nhiều cách khác nhau. Hệ thống phân quyền rõ ràng giúp duy trì chất lượng nội dung.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all text-center group">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Feather className="w-8 h-8"/>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-800">Tác Giả (Author)</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Bạn có đam mê viết lách? Hãy đăng ký trở thành Tác giả để xuất bản những bộ truyện Sáng tác (Original) của riêng mình và nhận phản hồi từ độc giả.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all text-center group">
                    <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Globe className="w-8 h-8"/>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-800">Dịch Giả (Translator)</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Mang những tác phẩm Light Novel nổi tiếng thế giới về Việt Nam. Hệ thống hỗ trợ biên tập và quản lý chương truyện chuyên nghiệp.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all text-center group">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <Shield className="w-8 h-8"/>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-800">Điều Hành (Mod/Admin)</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Đội ngũ quản trị viên và kiểm duyệt viên tận tâm, đảm bảo nội dung sạch, đúng quy định và hỗ trợ cộng đồng nhanh chóng.
                    </p>
                </div>
            </div>
        </div>

        {/* CTA BOTTOM */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-12 text-center text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Bạn đã sẵn sàng tham gia?</h2>
                <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                    Đăng ký tài khoản ngay hôm nay để lưu truyện, bình luận và trở thành một phần của cộng đồng BetoBook.
                </p>
                <Link to="/login" className="px-10 py-4 bg-white text-blue-600 rounded-full font-bold hover:bg-slate-100 transition-colors shadow-lg inline-block">
                    Đăng ký miễn phí
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};