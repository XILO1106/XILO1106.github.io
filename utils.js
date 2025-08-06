// articlesLoader.js - 文章加载复用模块
export const Utils = {
    articlesData: [],

    createArticlesCard(article) {
        const articleElement = document.createElement('article');
        articleElement.className = 'bg-white rounded-xl overflow-hidden shadow-md article-hover flex flex-col h-full';

        // 仅在有图片时显示图片区域
        const imageHtml = article.image ? `
        <div class="h-48 overflow-hidden rounded-t-xl">
            <img src="${article.image}" alt="${article.title}文章封面" class="w-full h-full object-cover">
        </div>
    ` : '';

        // 生成多个分类标签
        const categoriesHtml = article.categories && article.categories.length
            ? article.categories.map(category => `
            <span class="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                ${category}
            </span>
        `).join('')
            : '<span class="text-muted">无分类</span>';

        articleElement.innerHTML = `
        ${imageHtml}
        <div class="p-6 flex flex-col flex-grow">
            <div class="space-y-3 flex-grow">
                <div class="flex items-center text-sm">
                    <span class="fa fa-calendar-o mr-2 text-muted"></span>
                    <time class="text-muted">${article.date}</time>
                    <span class="mx-2 text-muted">•</span>
                    <span class="fa fa-folder-o mr-2 text-muted"></span>
                    <div class="categories-container">
                        ${categoriesHtml}
                    </div>
                </div>
                <h3 class="text-xl font-semibold hover:text-primary transition-colors">
                    <a href="article.html?id=${article.id}">${article.title}</a>
                </h3>
                <p class="text-muted line-clamp-3">${article.description}</p>
            </div>
            <a href="article.html?id=${article.id}" class="inline-flex items-center font-medium text-primary hover:text-primary/80 transition-colors mt-4">
                阅读更多
                <span class="fa fa-long-arrow-right ml-2"></span>
            </a>
        </div>
    `;

        return articleElement;
    },
    
    /**
     * 加载配置文件
     * 从conf.json获取网站配置信息，包含个人信息、链接等
     * @returns {Promise<Object>} 配置数据对象
     */
    async loadConfig() {

        const response = await fetch('conf.json');
        if (!response.ok) {
            return {
                name: "名字不见啦",
                introduction: "简介不见啦",
                latestArticlesQuote: "不见啦",
                footerTitle: "已经到底啦~",
                footerQuote: "都不见啦",
                copyright: "©不见啦",
                avatar: "#",
                links: {
                    github: "#",
                    qq: "#"
                }
            };
        }
        let config = await response.json();
        fetch('header.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('header-placeholder').innerHTML = data;
                document.getElementById('navbar-title').textContent = `${config.name}的博客`;

                // 导航栏滚动效果
                const navbar = document.getElementById('navbar');
                const backToTop = document.getElementById('back-to-top');

                window.addEventListener('scroll', function () {
                    if (window.scrollY > 50) {
                        navbar.classList.add('shadow-md', 'py-2');
                        navbar.classList.remove('py-4');

                        backToTop.classList.remove('opacity-0', 'invisible');
                        backToTop.classList.add('opacity-100', 'visible');
                    } else {
                        navbar.classList.remove('shadow-md', 'py-2');
                        navbar.classList.add('py-4');

                        backToTop.classList.add('opacity-0', 'invisible');
                        backToTop.classList.remove('opacity-100', 'visible');
                    }
                });

                // 移动端菜单切换
                const menuToggle = document.getElementById('menu-toggle');
                const mobileMenu = document.getElementById('mobile-menu');

                menuToggle.addEventListener('click', function () {
                    mobileMenu.classList.toggle('hidden');
                });

                // 平滑滚动处理
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();

                        // 点击后关闭移动端菜单
                        if (!mobileMenu.classList.contains('hidden')) {
                            mobileMenu.classList.add('hidden');
                        }

                        const targetId = this.getAttribute('href');
                        const targetElement = document.querySelector(targetId);

                        if (targetElement) {
                            window.scrollTo({
                                top: targetElement.offsetTop - 80,  // 偏移量避免被导航栏遮挡
                                behavior: 'smooth'
                            });
                        }
                    });
                });
            });
        fetch('footer.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('footer-placeholder').innerHTML = data;
                document.getElementById('footer-github-link').href = config.links.github;
                document.getElementById('footer-qq-link').href = config.links.qq;
                document.getElementById('footer-title').textContent = config.footerTitle;
                document.getElementById('footer-quote').textContent = config.footerQuote;
                document.getElementById('copyright-info').textContent = config.copyright;
            });

        const button = document.createElement('button');
        button.id = 'back-to-top';
        button.className = 'fixed bottom-8 right-8 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg opacity-0 invisible transition-all duration-300 hover:bg-primary/90';
        button.innerHTML = '<span class="fa fa-chevron-up"></span>';

        // 添加到页面
        document.body.appendChild(button);

        // 点击事件
        button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // 滚动监听
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                button.classList.remove('opacity-0', 'invisible');
                button.classList.add('opacity-100', 'visible');
            } else {
                button.classList.remove('opacity-100', 'visible');
                button.classList.add('opacity-0', 'invisible');
            }
        });

        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.classList.add('opacity-0', 'transition-opacity', 'duration-500');
            img.onload = function () {
                this.classList.remove('opacity-0');
                this.classList.add('opacity-100');
            };
            // 处理已缓存的图片
            if (img.complete) {
                img.classList.remove('opacity-0');
                img.classList.add('opacity-100');
            }
        });
        return config;
    },

    /**
     * 加载并解析所有文章文件的元数据（不包含完整内容）
     * @param {string} configPath - 配置文件路径，默认为'conf.json'
     * @returns {Promise<Array>} 解析后的文章元数据数组
     */
    async loadArticles(configPath = 'conf.json') {
        try {
            // 加载配置文件
            const confResponse = await fetch(configPath);
            if (!confResponse.ok) throw new Error('无法加载配置文件');

            const config = await confResponse.json();
            const filePaths = config.articles || [];

            if (!Array.isArray(filePaths)) {
                throw new Error('配置文件中的articles不是数组');
            }

            // 加载并解析每个文章文件的元数据
            this.articlesData = await Promise.all(
                filePaths.map(async (filePath, index) => {
                    try {
                        // 只获取文件头信息，不加载完整内容
                        const headResponse = await fetch(filePath, {method: 'HEAD'});
                        if (!headResponse.ok) throw new Error('文件访问失败');

                        // 获取文件基本信息
                        const lastModified = new Date(headResponse.headers.get('Last-Modified'));
                        const fileName = filePath.split('/').pop().replace(/\.[^/.]+$/, "");

                        // 为了获取标题行等信息，需要读取文件前几行
                        const response = await fetch(filePath);
                        const content = await response.text();
                        const lines = content.split('\n').map(line => line.trim());

                        // 处理分类：支持多个分类用逗号分隔
                        const categories = lines[1]
                            ? lines[1].split(',').map(cat => cat.trim()).filter(Boolean)
                            : [];

                        // 构建文章信息对象（不包含完整内容）
                        const article = {
                            id: index + 1,
                            title: fileName,
                            date: lastModified.toLocaleString(),
                            description: lines[0] || '',
                            categories: categories,  // 改为复数形式的categories，存储分类数组
                            mdPath: filePath // 存储文件路径，而不是完整内容
                        };

                        // 添加图片字段（如果存在）
                        if (lines[2]) {
                            article.image = lines[2];
                        }

                        return article;
                    } catch (error) {
                        console.error(`处理文件 ${filePath} 时出错:`, error);
                        return null; // 出错时返回null
                    }
                })
            );

            // 过滤掉null值（加载失败的文件）
            this.articlesData = this.articlesData.filter(article => article !== null);
            return this.articlesData;

        } catch (error) {
            console.error('加载文章元数据时出错:', error);
            throw error; // 抛出错误供调用者处理
        }
    },

    /**
     * 获取所有文章的元数据
     * @returns {Array} 文章元数据数组
     */
    getArticles() {
        return [...this.articlesData]; // 返回副本，避免外部直接修改
    },

    /**
     * 根据ID获取单篇文章的元数据
     * @param {number} id - 文章ID
     * @returns {Object|null} 文章元数据对象或null
     */
    getArticleById(id) {
        return this.articlesData.find(article => article.id === id) || null;
    },

    /**
     * 根据文章ID加载并获取完整内容
     * @param {number} id - 文章ID
     * @returns {Promise<string>} 文章的完整内容
     */
    async getArticleContent(id) {
        const article = this.getArticleById(id);
        if (!article) {
            throw new Error(`找不到ID为${id}的文章`);
        }

        try {
            const response = await fetch(article.mdPath);
            if (!response.ok) throw new Error('无法加载文章内容');

            const content = await response.text();
            const lines = content.split('\n').map(line => line.trim());
            // 返回从第四行开始的内容（与原逻辑保持一致）
            return lines.slice(3).join('\n') || '';
        } catch (error) {
            console.error(`加载文章${id}内容时出错:`, error);
            throw error;
        }
    },

    /**
     * 获取所有唯一分类
     * @returns {Array} 分类数组
     */
    getCategories() {
        const categories = new Set();
        this.articlesData.forEach(article => {
            // 遍历文章的所有分类并添加到集合中
            article.categories.forEach(category => {
                if (category) categories.add(category);
            });
        });
        return Array.from(categories);
    }
};
    