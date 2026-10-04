import { useEffect, useRef, useState } from 'react';

import { blogConfig } from '../config';

const Blog = () => {
  const shouldRenderNothing = !blogConfig.heading && blogConfig.posts.length === 0;

  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const hasExtraPosts = blogConfig.posts.length > 2;
  const visiblePosts =
    showAllPosts || !hasExtraPosts
      ? blogConfig.posts
      : blogConfig.posts.slice(0, 2);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (shouldRenderNothing) return null;

  return (
    <section
      id="blog"
      ref={sectionRef}
      className="py-20 md:py-28 bg-white"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span
            className={`inline-block mb-4 text-sm font-medium tracking-widest uppercase text-[var(--chevron-blue)] transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {blogConfig.tag}
          </span>
          <h2
            className={`font-heading text-[1.3125rem] md:text-[1.575rem] lg:text-[2.1rem] text-black transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            {blogConfig.heading}
          </h2>
        </div>

        {/* Blog Grid - Chevron Newsroom Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visiblePosts.map((post, index) => (
            <article
              key={post.id}
              className={`group cursor-pointer transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${300 + index * 120}ms` }}
            >
              {/* Background Image */}
              <div
                className="relative h-56 overflow-hidden mb-4"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div>
                {/* Date - Chevron Newsroom Style */}
                <span className="text-xs text-[var(--chevron-muted)] font-medium">
                  {post.date}
                </span>

                {/* Title */}
                <h3 className="font-heading text-[0.875rem] text-black mt-2 mb-3 leading-tight group-hover:text-[var(--chevron-blue)] transition-colors">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-[var(--chevron-muted)] leading-relaxed mb-4">
                  {post.excerpt}
                </p>

                {/* Read More Link */}
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-sm text-[var(--chevron-blue)] font-medium hover:gap-2 transition-all"
                >
                  {blogConfig.readMoreText}

                </a>
              </div>
            </article>
          ))}
        </div>

        {/* View All Link */}
        {blogConfig.viewAllText && hasExtraPosts && (
          <div
            className={`text-center mt-12 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '700ms' }}
          >
            <button
              type="button"
              onClick={() => setShowAllPosts((currentValue) => !currentValue)}
              className="inline-flex items-center gap-2 text-[var(--chevron-blue)] font-medium hover:gap-3 transition-all"
            >
              {showAllPosts ? 'Show Fewer' : blogConfig.viewAllText}

            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Blog;
