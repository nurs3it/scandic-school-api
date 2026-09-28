-- CreateTable
CREATE TABLE "AttestationSection" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" INTEGER,
    "titleKk" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttestationSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttestationFile" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttestationFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AttestationSection_slug_key" ON "AttestationSection"("slug");

-- CreateIndex
CREATE INDEX "AttestationSection_parentId_order_idx" ON "AttestationSection"("parentId", "order");

-- CreateIndex
CREATE INDEX "AttestationFile_sectionId_order_idx" ON "AttestationFile"("sectionId", "order");

-- AddForeignKey
ALTER TABLE "AttestationSection" ADD CONSTRAINT "AttestationSection_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AttestationSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttestationFile" ADD CONSTRAINT "AttestationFile_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "AttestationSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed: attestation sections tree (state attestation structure, RK)
INSERT INTO "AttestationSection" ("id", "slug", "parentId", "titleKk", "titleRu", "titleEn", "order", "updatedAt") VALUES
(1, 'general-information', NULL, 'Жалпы сипаттама', 'Общая характеристика', 'General information', 0, CURRENT_TIMESTAMP),
(2, 'founding-and-legal-documents', 1, 'Білім беру ұйымының құрылтайшылық және құқық белгілейтін құжаттары', 'Учредительные и правоустанавливающие документы организации образования', 'Founding and legal documents', 0, CURRENT_TIMESTAMP),
(3, 'school-work-plan', 1, 'Білім беру ұйымының жұмыс жоспары', 'План работы организации образования', 'School work plan', 1, CURRENT_TIMESTAMP),
(4, 'compliance-of-actual-data-with-the-national-education', 1, 'Нақты деректердің «Ұлттық білім беру дерекқоры» ақпараттық жүйесіне сәйкестігі', 'Соответствие фактических данных информационной системе «НОБД»', 'Compliance of actual data with the National Education Database (NOBD)', 2, CURRENT_TIMESTAMP),
(5, 'academic-and-methodological-work', NULL, 'Оқу-әдістемелік жұмыс', 'Учебно-методическая работа', 'Academic and methodological work', 1, CURRENT_TIMESTAMP),
(6, 'class-register', 5, 'Журнал', 'Журнал', 'Class register', 0, CURRENT_TIMESTAMP),
(7, 'programmes', 6, 'Бағдарламалар', 'Программы', 'Programmes', 0, CURRENT_TIMESTAMP),
(8, '2023-2024-academic-year', 7, '2023-2024 оқу жылы', '2023-2024 учебный год', '2023-2024 academic year', 0, CURRENT_TIMESTAMP),
(9, '2024-2025-academic-year', 7, '2024-2025 оқу жылы', '2024-2025 учебный год', '2024-2025 academic year', 1, CURRENT_TIMESTAMP),
(10, '2025-2026-academic-year', 7, '2025-2026 оқу жылы', '2025-2026 учебный год', '2025-2026 academic year', 2, CURRENT_TIMESTAMP),
(11, 'curricula', 5, 'Оқу жоспарлары', 'Учебные планы', 'Curricula', 1, CURRENT_TIMESTAMP),
(12, 'internal-school-monitoring', 5, 'Мектепшілік бақылау', 'Внутришкольный контроль', 'Internal school monitoring', 2, CURRENT_TIMESTAMP),
(13, 'order-on-the-start-of-the-academic-year', 5, 'Оқу жылының басталуы бұйрығы', 'Приказ о начале учебного года', 'Order on the start of the academic year', 3, CURRENT_TIMESTAMP),
(14, 'life-safety-basics', 5, 'Өмір қауіпсіздігі негіздері', 'Основы безопасности жизнедеятельности', 'Life safety basics', 4, CURRENT_TIMESTAMP),
(15, 'class-timetable', 5, 'Сабақ кестесі', 'Расписание уроков', 'Class timetable', 5, CURRENT_TIMESTAMP),
(16, 'class-timetable-2023-2024-academic-year', 15, '2023-2024 оқу жылы', '2023-2024 учебный год', '2023-2024 academic year', 0, CURRENT_TIMESTAMP),
(17, 'class-timetable-2024-2025-academic-year', 15, '2024-2025 оқу жылы', '2024-2025 учебный год', '2024-2025 academic year', 1, CURRENT_TIMESTAMP),
(18, 'class-timetable-2025-2026-academic-year', 15, '2025-2026 оқу жылы', '2025-2026 учебный год', '2025-2026 academic year', 2, CURRENT_TIMESTAMP),
(19, 'pastoral-work-report', 5, 'Тәрбие есебі', 'Отчёт по воспитательной работе', 'Pastoral work report', 6, CURRENT_TIMESTAMP),
(20, 'external-assessment', NULL, 'Сыртқы бақылау', 'Внешний контроль', 'External assessment', 2, CURRENT_TIMESTAMP),
(21, 'monitoring-of-student-achievement', 20, 'Білім алушылардың білім жетістіктеріне мониторинг жүргізу', 'Мониторинг учебных достижений обучающихся', 'Monitoring of student achievement', 0, CURRENT_TIMESTAMP),
(22, 'international-studies-pisa-pirls-icils-timss-talis', 20, 'Халықаралық зерттеулер (PISA, PIRLS, ICILS, TIMSS, TALIS)', 'Международные исследования (PISA, PIRLS, ICILS, TIMSS, TALIS)', 'International studies (PISA, PIRLS, ICILS, TIMSS, TALIS)', 1, CURRENT_TIMESTAMP),
(23, 'state-control-state-attestation', 20, 'Мемлекеттік бақылау (мемлекеттік аттестаттау)', 'Государственный контроль (государственная аттестация)', 'State control (state attestation)', 2, CURRENT_TIMESTAMP),
(24, 'staffing', NULL, 'Кадр құрамы', 'Кадровый состав', 'Staffing', 3, CURRENT_TIMESTAMP),
(25, 'teaching-load-of-teachers-tariffication', 24, 'Педагогтердің оқу жүктемесі (тарифтеу) туралы мәлімет', 'Сведения об учебной нагрузке педагогов (тарификация)', 'Teaching load of teachers (tariffication)', 0, CURRENT_TIMESTAMP),
(26, 'head-of-school-and-deputies', 24, 'Білім беру ұйымының басшысы, басшының орынбасарлары туралы мәлімет', 'Сведения о руководителе и заместителях руководителя', 'Head of school and deputies', 1, CURRENT_TIMESTAMP),
(27, 'copies-of-diplomas-confirming-teachers-subject', 24, 'Тиісті бейіні бойынша педагогтермен қамтамасыз етілгенін растайтын қосымшалары бар дипломдар көшірмелерінің болуы', 'Копии дипломов с приложениями, подтверждающие обеспеченность педагогами по профилю', 'Copies of diplomas confirming teachers'' subject qualifications', 2, CURRENT_TIMESTAMP),
(28, 'teachers-professional-development-certificates-every-three', 24, 'Педагогтердің оқытылатын пәні бойынша үш жылда бір рет біліктілігін арттырғандығын растайтын сертификаттары', 'Сертификаты о повышении квалификации педагогов по преподаваемому предмету раз в три года', 'Teachers'' professional development certificates (every three years)', 3, CURRENT_TIMESTAMP),
(29, 'teachers-professional-development-certificates-every-three-2023-2024-academic-year', 28, '2023-2024 оқу жылы', '2023-2024 учебный год', '2023-2024 academic year', 0, CURRENT_TIMESTAMP),
(30, 'teachers-professional-development-certificates-every-three-2024-2025-academic-year', 28, '2024-2025 оқу жылы', '2024-2025 учебный год', '2024-2025 academic year', 1, CURRENT_TIMESTAMP),
(31, 'teachers-professional-development-certificates-every-three-2025-2026-academic-year', 28, '2025-2026 оқу жылы', '2025-2026 учебный год', '2025-2026 academic year', 2, CURRENT_TIMESTAMP),
(32, 'share-of-expert-researcher-and-master-teachers', 24, 'Педагог-сарапшылардың, педагог-зерттеушілердің, педагог-шеберлердің үлесі', 'Доля педагогов-экспертов, педагогов-исследователей, педагогов-мастеров', 'Share of expert, researcher and master teachers', 4, CURRENT_TIMESTAMP),
(33, 'appendix-7', 24, '7 қосымша', 'Приложение 7', 'Appendix 7', 5, CURRENT_TIMESTAMP),
(34, 'course-certificates', 24, 'Курс сертификаттары', 'Сертификаты курсов', 'Course certificates', 6, CURRENT_TIMESTAMP),
(35, 'course-certificates-2023-2024-academic-year', 34, '2023-2024 оқу жылы', '2023-2024 учебный год', '2023-2024 academic year', 0, CURRENT_TIMESTAMP),
(36, 'course-certificates-2024-2025-academic-year', 34, '2024-2025 оқу жылы', '2024-2025 учебный год', '2024-2025 academic year', 1, CURRENT_TIMESTAMP),
(37, 'course-certificates-2025-2026-academic-year', 34, '2025-2026 оқу жылы', '2025-2026 учебный год', '2025-2026 academic year', 2, CURRENT_TIMESTAMP),
(38, 'tariffication', 24, 'Тарификация', 'Тарификация', 'Tariffication', 7, CURRENT_TIMESTAMP),
(39, 'explanatory-notes', 24, 'Түсініктемелер', 'Пояснения', 'Explanatory notes', 8, CURRENT_TIMESTAMP),
(40, 'teacher-attestation-long-term-plan', 24, 'Педагогтерді аттестаттаудың перспективалық жоспары', 'Перспективный план аттестации педагогов', 'Teacher attestation long-term plan', 9, CURRENT_TIMESTAMP),
(41, 'board-of-trustees-minutes', 24, 'Қамқоршылық кеңес хаттамасы', 'Протокол попечительского совета', 'Board of trustees minutes', 10, CURRENT_TIMESTAMP),
(42, 'pedagogical-council-minutes', 24, 'Педагогикалық кеңес хаттамалары', 'Протоколы педагогического совета', 'Pedagogical council minutes', 11, CURRENT_TIMESTAMP),
(43, 'disciplinary-action-order', 24, 'Тәртіптік жаза қолдану туралы бұйрық', 'Приказ о применении дисциплинарного взыскания', 'Disciplinary action order', 12, CURRENT_TIMESTAMP),
(44, 'student-body', NULL, 'Білім алушылар контингенті', 'Контингент обучающихся', 'Student body', 4, CURRENT_TIMESTAMP),
(45, 'teacher-qualification-category-upgrades-every-five-years', 44, 'Педагогтердің біліктілік санаты деңгейін бес жылда бір рет арттыруы', 'Повышение квалификационной категории педагогов раз в пять лет', 'Teacher qualification category upgrades (every five years)', 0, CURRENT_TIMESTAMP),
(46, 'teachers', 45, 'Мұғалімдер', 'Учителя', 'Teachers', 0, CURRENT_TIMESTAMP),
(47, 'hiring-teachers-for-vacant-or-temporary-positions', 44, 'Білім ұйымдарына бос немесе уақытша лауазымға педагогтерді қабылдау', 'Приём педагогов на вакантные или временно вакантные должности', 'Hiring teachers for vacant or temporary positions', 1, CURRENT_TIMESTAMP),
(48, 'student-information', 44, 'Білім алушылар туралы мәлімет', 'Сведения об обучающихся', 'Student information', 2, CURRENT_TIMESTAMP),
(49, 'admission', 44, 'Оқуға қабылдау', 'Приём на обучение', 'Admission', 3, CURRENT_TIMESTAMP),
(50, 'register-of-arriving-and-departing-students', 49, 'Кеткен және келген білім алушыларды есепке алу кітабы', 'Книга учёта выбывших и прибывших обучающихся', 'Register of arriving and departing students', 0, CURRENT_TIMESTAMP),
(51, '2023-2024-arrivals', 50, '2023-2024 келгендер', '2023-2024 прибывшие', '2023-2024 arrivals', 0, CURRENT_TIMESTAMP),
(52, '2023-2024-departures', 50, '2023-2024 кеткендер', '2023-2024 выбывшие', '2023-2024 departures', 1, CURRENT_TIMESTAMP),
(53, '2024-2025-arrivals', 50, '2024-2025 келгендер', '2024-2025 прибывшие', '2024-2025 arrivals', 2, CURRENT_TIMESTAMP),
(54, '2024-2025-departures', 50, '2024-2025 кеткендер', '2024-2025 выбывшие', '2024-2025 departures', 3, CURRENT_TIMESTAMP),
(55, '2025-2026-arrivals', 50, '2025-2026 келгендер', '2025-2026 прибывшие', '2025-2026 arrivals', 4, CURRENT_TIMESTAMP),
(56, '2025-2026-departures', 50, '2025-2026 кеткендер', '2025-2026 выбывшие', '2025-2026 departures', 5, CURRENT_TIMESTAMP),
(57, 'appendix-8', 44, '8 қосымша', 'Приложение 8', 'Appendix 8', 4, CURRENT_TIMESTAMP),
(58, 'academic-work', NULL, 'Оқу жұмысы', 'Учебная работа', 'Academic work', 5, CURRENT_TIMESTAMP),
(59, 'compliance-of-working-curricula-with-standard-curricula', 58, 'Оқу жұмыс жоспарларының үлгілік оқу жоспарларына сәйкестігі', 'Соответствие рабочих учебных планов типовым учебным планам', 'Compliance of working curricula with standard curricula', 0, CURRENT_TIMESTAMP),
(60, 'approved-class-timetable-based-on-the-curriculum', 58, 'Оқу жоспары негізінде бекітілген сабақ кестесі', 'Расписание уроков, утверждённое на основе учебного плана', 'Approved class timetable based on the curriculum', 1, CURRENT_TIMESTAMP),
(61, 'approved-class-timetable-based-on-the-curriculum-2023-2024-academic-year', 60, '2023-2024 оқу жылы', '2023-2024 учебный год', '2023-2024 academic year', 0, CURRENT_TIMESTAMP),
(62, 'approved-class-timetable-based-on-the-curriculum-2024-2025-academic-year', 60, '2024-2025 оқу жылы', '2024-2025 учебный год', '2024-2025 academic year', 1, CURRENT_TIMESTAMP),
(63, 'approved-class-timetable-based-on-the-curriculum-2025-2026-academic-year', 60, '2025-2026 оқу жылы', '2025-2026 учебный год', '2025-2026 academic year', 2, CURRENT_TIMESTAMP),
(64, 'teaching-students-with-special-educational-needs', 58, 'Ерекше білім беру қажеттіліктері бар білім алушыларға оқытуды ұйымдастыру', 'Организация обучения обучающихся с особыми образовательными потребностями', 'Teaching students with special educational needs', 2, CURRENT_TIMESTAMP),
(65, 'formative-and-summative-assessment-compliance', 58, 'Формативті және жиынтық бағалау талаптарын сақтау', 'Соблюдение требований формативного и суммативного оценивания', 'Formative and summative assessment compliance', 3, CURRENT_TIMESTAMP),
(66, 'appendix-13', 65, '13 қосымша', 'Приложение 13', 'Appendix 13', 0, CURRENT_TIMESTAMP),
(67, 'exam-protocols-2023-2024', 65, 'Емтихан хаттамалары 2023-2024 оқу жылы', 'Протоколы экзаменов 2023-2024 учебный год', 'Exam protocols 2023-2024', 1, CURRENT_TIMESTAMP),
(68, 'exam-protocols-2024-2025', 65, 'Емтихан хаттамалары 2024-2025 оқу жылы', 'Протоколы экзаменов 2024-2025 учебный год', 'Exam protocols 2024-2025', 2, CURRENT_TIMESTAMP),
(69, 'final-attestation', 58, 'Қорытынды аттестаттау', 'Итоговая аттестация', 'Final attestation', 4, CURRENT_TIMESTAMP),
(70, 'start-of-the-academic-year', 58, 'Оқу жылының басталуы', 'Начало учебного года', 'Start of the academic year', 5, CURRENT_TIMESTAMP),
(71, 'pastoral-work', NULL, 'Тәрбие жұмысы', 'Воспитательная работа', 'Pastoral work', 6, CURRENT_TIMESTAMP),
(72, 'unified-upbringing-programme', 71, 'Біртұтас тәрбие бағдарламасы', 'Единая программа воспитания', 'Unified upbringing programme', 0, CURRENT_TIMESTAMP),
(73, 'internal-school-records', 71, 'Мектепішілік есепке алуды жүргізу', 'Ведение внутришкольного учёта', 'Internal school records', 1, CURRENT_TIMESTAMP),
(74, 'school-psychologist', 71, 'Педагог-психологтың жұмысы', 'Работа педагога-психолога', 'School psychologist', 2, CURRENT_TIMESTAMP),
(75, 'social-pedagogue', 71, 'Әлеуметтік педагогтің жұмысы', 'Работа социального педагога', 'Social pedagogue', 3, CURRENT_TIMESTAMP),
(76, 'working-with-parents', 71, 'Ата-аналармен қарым-қатынас', 'Взаимодействие с родителями', 'Working with parents', 4, CURRENT_TIMESTAMP),
(77, 'road-safety', 71, 'Жол жүру ережесі', 'Правила дорожного движения', 'Road safety', 5, CURRENT_TIMESTAMP),
(78, 'facilities-and-resources', NULL, 'Оқу-материалдық активтер', 'Учебно-материальные активы', 'Facilities and resources', 7, CURRENT_TIMESTAMP),
(79, 'building-information-and-requirements', 78, 'Ғимарат туралы мәлімет, білім беру объектілеріне қойылатын талаптар', 'Сведения о здании, требования к объектам образования', 'Building information and requirements', 0, CURRENT_TIMESTAMP),
(80, 'barrier-free-access-for-children-with-special-needs', 78, 'Ерекше білім беруді қажет ететін балалар үшін кедергісіз қол жеткізу', 'Безбарьерный доступ для детей с особыми образовательными потребностями', 'Barrier-free access for children with special needs', 1, CURRENT_TIMESTAMP),
(81, 'digital-school', 78, 'Цифрлы мектеп', 'Цифровая школа', 'Digital school', 2, CURRENT_TIMESTAMP),
(82, 'classrooms', 78, 'Оқу кабинеттері', 'Учебные кабинеты', 'Classrooms', 3, CURRENT_TIMESTAMP),
(83, 'sports-hall', 78, 'Спорт залымен жабдықталуы', 'Оснащение спортивным залом', 'Sports hall', 4, CURRENT_TIMESTAMP),
(84, 'catering-facilities', 78, 'Тамақтандыру объектісінің болуы', 'Наличие объекта питания', 'Catering facilities', 5, CURRENT_TIMESTAMP),
(85, 'medical-office', 78, 'Медициналық пункттермен қамтамасыз етілуі', 'Обеспеченность медицинским пунктом', 'Medical office', 6, CURRENT_TIMESTAMP),
(86, 'library-and-reading-room', 78, 'Кітапхана, оқу залының болуы', 'Наличие библиотеки и читального зала', 'Library and reading room', 7, CURRENT_TIMESTAMP),
(87, 'library-collection-analysis', 78, 'Кітапхана қорына талдау', 'Анализ библиотечного фонда', 'Library collection analysis', 8, CURRENT_TIMESTAMP),
(88, 'sanitary-facilities', 78, 'Санитариялық нормаларға сәйкес санитариялық тораптардың болуы', 'Санитарные узлы в соответствии с санитарными нормами', 'Sanitary facilities', 9, CURRENT_TIMESTAMP),
(89, 'drinking-water-provision', 78, 'Ауыз су режимінің ұйымдастырылуы', 'Организация питьевого режима', 'Drinking water provision', 10, CURRENT_TIMESTAMP),
(90, 'sanitary-inspection-report', 78, 'СЭС қорытындысы', 'Заключение СЭС', 'Sanitary inspection report', 11, CURRENT_TIMESTAMP),
(91, 'appendix-9', 78, '9 қосымша', 'Приложение 9', 'Appendix 9', 12, CURRENT_TIMESTAMP),
(92, 'appendix-10', 78, '10 қосымша', 'Приложение 10', 'Appendix 10', 13, CURRENT_TIMESTAMP),
(93, 'appendix-11', 78, '11 қосымша', 'Приложение 11', 'Appendix 11', 14, CURRENT_TIMESTAMP),
(94, 'student-safety', NULL, 'Білім алушылардың қауіпсіздігі', 'Безопасность обучающихся', 'Student safety', 8, CURRENT_TIMESTAMP),
(95, 'cctv-per-orders-no-32-and-no-49', 94, '№ 32 және № 49 бұйрықтарға сәйкес бейнекамералардың болуы', 'Наличие видеокамер согласно приказам № 32 и № 49', 'CCTV per orders No. 32 and No. 49', 0, CURRENT_TIMESTAMP),
(96, 'fire-safety-compliance', 94, 'Өрт қауіпсіздігі талаптарының сақталуы', 'Соблюдение требований пожарной безопасности', 'Fire safety compliance', 1, CURRENT_TIMESTAMP),
(97, 'anti-terrorism-protection-per-order-no-117', 94, '№ 117 бұйрыққа сәйкес терроризмге қарсы қорғалуды ұйымдастыру', 'Организация антитеррористической защищённости согласно приказу № 117', 'Anti-terrorism protection per order No. 117', 2, CURRENT_TIMESTAMP),
(98, 'elective-programmes', NULL, 'Факультатив бағдарламалары', 'Программы факультативов', 'Elective programmes', 9, CURRENT_TIMESTAMP),
(99, 'elective-programmes-2023-2024-academic-year', 98, '2023-2024 оқу жылы', '2023-2024 учебный год', '2023-2024 academic year', 0, CURRENT_TIMESTAMP),
(100, 'elective-programmes-2024-2025-academic-year', 98, '2024-2025 оқу жылы', '2024-2025 учебный год', '2024-2025 academic year', 1, CURRENT_TIMESTAMP),
(101, 'elective-programmes-2025-2026-academic-year', 98, '2025-2026 оқу жылы', '2025-2026 учебный год', '2025-2026 academic year', 2, CURRENT_TIMESTAMP),
(102, 'information-resources-and-library-collection', NULL, 'Ақпараттық ресурстар және кітапхана қоры', 'Информационные ресурсы и библиотечный фонд', 'Information resources and library collection', 10, CURRENT_TIMESTAMP),
(103, 'appendix-12', 102, '12 қосымша', 'Приложение 12', 'Appendix 12', 0, CURRENT_TIMESTAMP),
(104, 'None-explanatory-notes', NULL, 'Түсініктемелер', 'Пояснения', 'Explanatory notes', 11, CURRENT_TIMESTAMP),
(105, 'survey-results', NULL, 'Сауалнама қорытындысы', 'Итоги анкетирования', 'Survey results', 12, CURRENT_TIMESTAMP),
(106, 'shortcomings-and-remarks', NULL, 'Кемшіліктер мен ескертулер', 'Недостатки и замечания', 'Shortcomings and remarks', 13, CURRENT_TIMESTAMP),
(107, 'conclusions-and-recommendations', NULL, 'Қорытындылар мен ұсыныстар', 'Выводы и предложения', 'Conclusions and recommendations', 14, CURRENT_TIMESTAMP),
(108, 'self-assessment', NULL, 'Өзін-өзі бағалау', 'Самооценка', 'Self-assessment', 15, CURRENT_TIMESTAMP),
(109, 'appendices', NULL, 'Қосымшалар', 'Приложения', 'Appendices', 16, CURRENT_TIMESTAMP);

SELECT setval(pg_get_serial_sequence('"AttestationSection"', 'id'), (SELECT MAX("id") FROM "AttestationSection"));
