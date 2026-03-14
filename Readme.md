Now I can see your actual project clearly from all the images. Let me read everything carefully.

From your screenshots I can see:

**Your actual projects:**
- `audit-service`
- `discoveryservice` ← Eureka
- `gatewayauthorizer` ← Keycloak + SecurityConfig + GatewayController + TokenService
- `gatewayrouting` ← API Gateway with GatewaySwaggerAggregatorConfig
- `inventory-service`
- `item-service`

**Your actual packages:**
- `com.cognizant.gateway` — gatewayauthorizer
- `com.cognizant.gatewayrouting` — gatewayrouting
- `com.ecommerce.itemservice` — item-service

**Your actual files I can see:**
- `GatewayauthorizerApplication.java`
- `SecurityConfig.java` — uses `@EnableWebFluxSecurity`, `ServerHttpSecurity`
- `GatewayController.java` — `/tokens`, `getSREToken()`, `getDevOpsEngineerToken()`
- `TokenService.java`
- `GatewaySwaggerAggregatorConfig.java`
- `GatewayroutingApplication.java`
- `ItemServiceTest.java` — full Mockito tests

Now I have everything I need. Let me write the complete one hour script.

---

# COMPLETE ONE HOUR INTERVIEW SCRIPT
## Based on YOUR Actual Project

---

# OPENING — 2 Minutes

---

> "Good morning sir. I would like to walk you through my project in complete detail. I will cover everything from the beginning — what the project is, the architecture, every service, every file, the security, the routing, the testing — everything."

> "My project is called **EcommerceMicroservices**. It is a backend system for an e-commerce platform built using **Spring Boot Microservices Architecture**. The system manages products, inventory, notifications, and audit logs."

> "The complete system has **6 services** running together:"

> "**discoveryservice** — this is the Eureka Service Registry. All services register here."

> "**gatewayauthorizer** — this is the Keycloak based security service. It generates tokens for different roles and handles authentication."

> "**gatewayrouting** — this is the API Gateway. Single entry point for all requests. Routes traffic to correct service."

> "**item-service** — manages all product data."

> "**inventory-service** — manages stock levels."

> "**audit-service** — records every operation in the system."

---

# PART 1 — Why Microservices — 4 Minutes

---

> "Before I go into each service, let me explain why I chose microservices over monolithic architecture."

> "A monolithic application puts everything in one place — one codebase, one database, one deployment. The problem is if one part breaks the entire application goes down. You cannot scale one part independently. Every deployment requires restarting everything."

> "Microservices solves all of this. Each service is a separate independent Spring Boot application. Each has its own code, its own database, runs on its own port. If audit-service goes down, item-service and inventory-service keep running perfectly."

> "In my project every service is independently deployable. You can update item-service without touching any other service. You can scale inventory-service independently if it gets more traffic. This is the power of microservices."

---

# PART 2 — Discovery Service — Eureka — 6 Minutes

---

> "Let me start with the **discoveryservice** — this is the foundation that all other services depend on."

> "The problem it solves — when I have 6 services running, how does one service find another? What IP address, what port? In a production environment services run on different machines and their addresses keep changing. You cannot hardcode addresses."

> "The solution is **Service Discovery**. I used **Netflix Eureka** which is part of Spring Cloud. Eureka is a service registry — like a telephone directory for all my services."

> "When any service starts up, it automatically registers itself with Eureka saying — I am item-service and I am running on this IP and this port. Eureka keeps this information. When another service wants to call item-service, it asks Eureka — where is item-service? Eureka returns the address."

---

> "The discoveryservice has two key things:"

> "**First — the pom.xml dependency:**"

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

> "This single dependency turns a Spring Boot application into a Eureka server."

> "**Second — the main class annotation:**"

```java
@SpringBootApplication
@EnableEurekaServer
public class DiscoveryServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServiceApplication.class, args);
    }
}
```

> "@EnableEurekaServer — this one annotation is all that is needed to make this application a full Eureka server."

> "**application.properties key settings:**"

```properties
server.port=8761
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
```

> "Port 8761 is the standard Eureka port. register-with-eureka=false means Eureka server does not register itself as a client — it IS the server."

> "When discoveryservice starts I can open **http://localhost:8761** in browser. I see the Eureka dashboard. As each service starts, they appear in the dashboard showing their name, IP, port and status UP."

> "Every other service in my project has these lines in application.properties:"

```properties
spring.application.name=item-service
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true
eureka.instance.prefer-ip-address=true
```

> "And @EnableDiscoveryClient on the main class. This makes every service a Eureka client that registers automatically on startup."

---

# PART 3 — Gateway Authorizer — Keycloak Security — 12 Minutes

---

> "Now let me explain the **gatewayauthorizer** service. This is my security service. This is where I replaced JWT with **Keycloak**."

> "Let me first explain what Keycloak is and why I used it instead of manual JWT."

---

### What is Keycloak

> "Keycloak is an open source **Identity and Access Management** solution developed by Red Hat. Think of it as a dedicated security server that handles everything related to authentication — login, token generation, token validation, user management, roles and permissions."

> "In my previous version I was generating JWT tokens manually using a secret key. The problem with that approach is — I am responsible for everything. Creating the token, storing the secret, validating it, managing expiry, handling refresh tokens. Everything is manual."

> "With Keycloak, all of that is handled by a dedicated professional security server. Keycloak generates industry-standard OAuth2 and OpenID Connect tokens. It manages users, roles, clients, scopes. Everything is centralized."

> "The analogy is — instead of building your own lock and key system for your office, you hire a professional security company. They manage everything. You just trust their security badge."

---

### The gatewayauthorizer Package Structure

> "Let me walk through every file in gatewayauthorizer. Looking at my project structure I have four packages:"

```
com.cognizant.gateway
    GatewayauthorizerApplication.java

com.cognizant.gateway.configurations
    SecurityConfig.java

com.cognizant.gateway.controllers
    GatewayController.java

com.cognizant.gateway.services
    TokenService.java
```

---

### GatewayauthorizerApplication.java

> "This is the main entry point of the gatewayauthorizer service."

```java
@SpringBootApplication
public class GatewayauthorizerApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayauthorizerApplication.class, args);
    }
}
```

> "Simple Spring Boot main class. When this runs, the entire gatewayauthorizer service starts. It connects to Keycloak and becomes ready to generate tokens."

---

### SecurityConfig.java — Very Important

> "Now let me explain SecurityConfig.java. This is crucial and this is where it is different from regular Spring Security."

```java
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityFiltChain(
                            ServerHttpSecurity http) throws Exception {
        return http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .authorizeExchange(ex -> ex.anyExchange().permitAll())
            .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
            .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
            .build();
    }
}
```

> "Notice — this uses **@EnableWebFluxSecurity** not @EnableWebSecurity. And it uses **ServerHttpSecurity** not HttpSecurity. And the return type is **SecurityWebFilterChain** not SecurityFilterChain."

> "This is because the gatewayauthorizer uses **Spring WebFlux** — the reactive web framework — not the traditional Spring MVC. API Gateway and all gateway-related services use reactive programming because they handle many concurrent connections and need to be non-blocking."

> "The configuration says **permitAll()** — meaning all endpoints in this service are public. There is no authentication needed to call the /tokens endpoint. The reason is this service IS the authentication service — it is the one giving out tokens. You cannot require a token to get a token — that would be circular."

> "CSRF is disabled because this is a REST API. formLogin and httpBasic are disabled because we use token-based authentication through Keycloak."

---

### GatewayController.java — Token Generation

> "Now let me explain GatewayController.java. This is where clients come to get their Keycloak tokens."

```java
@RestController
@RequestMapping("/tokens")
public class GatewayController {

    @Autowired
    private TokenService tokenService;

    @GetMapping("/sre/v1.0")
    public Mono<String> getSREToken() {
        return tokenService.getToken("keycloak-with-sre-scope");
    }

    @GetMapping("/devopsengineer/v1.0")
    public Mono<String> getDevOpsEngineerToken() {
        return tokenService.getToken("keycloak-with-devopsengineer-scope");
    }
}
```

> "The base URL is /tokens. There are two endpoints."

> "**GET /tokens/sre/v1.0** — this generates a Keycloak token for SRE role — Site Reliability Engineer. It calls tokenService.getToken with the scope keycloak-with-sre-scope."

> "**GET /tokens/devopsengineer/v1.0** — this generates a token for DevOps Engineer role with scope keycloak-with-devopsengineer-scope."

> "Notice the return type is **Mono<String>**. Mono is from Project Reactor — it is a reactive type that represents a single value that will be available in the future. This is reactive programming. Instead of blocking and waiting for Keycloak to respond, Mono returns immediately and the value is delivered asynchronously when ready."

> "Different roles get different tokens with different scopes. SRE token might have permission to access certain services. DevOps engineer token has different permissions. This is **Role Based Access Control** through Keycloak."

---

### TokenService.java — Calls Keycloak

> "TokenService.java is where the actual communication with Keycloak happens."

> "It uses **WebClient** — Spring's reactive HTTP client — to call the Keycloak server's token endpoint. The Keycloak server URL, client ID, client secret, and scope are configured in application.properties."

> "The flow is:"

```
Client calls GET /tokens/sre/v1.0
        ↓
GatewayController calls tokenService.getToken("keycloak-with-sre-scope")
        ↓
TokenService makes a POST request to Keycloak token URL
with client_id, client_secret, grant_type=client_credentials, scope
        ↓
Keycloak validates the credentials
        ↓
Keycloak returns an access token (JWT format signed by Keycloak)
        ↓
TokenService returns it to Controller
        ↓
Controller returns it to Client as Mono<String>
```

> "The token returned by Keycloak is a standard **OAuth2 Bearer token** in JWT format — but signed and managed by Keycloak, not by us manually."

---

# PART 4 — Gateway Routing Service — 10 Minutes

---

> "Now let me explain **gatewayrouting** — the API Gateway. This is the single entry point for all client requests."

> "Before Gateway, clients had to know 4 different ports — 8081 for items, 8082 for inventory, 8083 for notifications, 8084 for audit. That is not clean and not scalable."

> "After Gateway, everything goes through ONE port. The gateway reads the URL and routes the request to the correct service automatically."

---

### GatewayroutingApplication.java

> "The main class:"

```java
@SpringBootApplication
@EnableDiscoveryClient
public class GatewayroutingApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayroutingApplication.class, args);
    }
}
```

> "@EnableDiscoveryClient means this gateway registers itself with Eureka and can look up other services from Eureka. When the routing says lb://item-service, it asks Eureka — where is item-service? Eureka returns the address. lb means Load Balanced."

---

### application.yml — The Routing Rules

> "The heart of the gateway is the routing configuration in application.yml. This is where I define which URL goes to which service."

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: item-service
          uri: lb://item-service
          predicates:
            - Path=/api/items/**

        - id: inventory-service
          uri: lb://inventory-service
          predicates:
            - Path=/api/inventory/**
```

> "Each route has three parts. **id** is just a name for this route. **uri** is where to send the request — lb://item-service means use load balancing and find item-service from Eureka. **predicates** defines what condition must match — Path=/api/items/** means if the incoming URL starts with /api/items/ send it to this route."

> "So when I send GET to gateway port 8080 /api/items, the gateway matches the first route, looks up item-service in Eureka, and forwards the request there."

---

### GatewaySwaggerAggregatorConfig.java — Very Impressive

> "Now let me explain GatewaySwaggerAggregatorConfig.java. This is a very advanced and impressive feature — **Swagger Aggregation**."

> "The problem — I have 4 business services each with its own Swagger UI on its own port. Developers have to open 4 different Swagger pages to see all APIs."

> "The solution — Swagger Aggregation. I configured the gateway to collect Swagger documentation from ALL services and show them in ONE single Swagger page at the gateway."

```java
@Configuration
public class GatewaySwaggerAggregatorConfig {

    private final RouteDefinitionLocator routeDefinitionLocator;
    private final SwaggerUiConfigProperties swaggerUiConfigProperties;

    @PostConstruct
    public void init() {
        Set<SwaggerUiConfigProperties.SwaggerUrl> urls =
            swaggerUiConfigProperties.getUrls() != null
                ? swaggerUiConfigProperties.getUrls()
                : new LinkedHashSet<>();

        routeDefinitionLocator.getRouteDefinitions()
            .subscribe(def -> {
                String routeId = def.getId();
                if (routeId == null || routeId.isBlank()) return;
                if (!routeId.endsWith("_PREFIX")) return;

                String serviceName = routeId.replace("_PREFIX", "");

                SwaggerUiConfigProperties.SwaggerUrl url =
                    new SwaggerUiConfigProperties.SwaggerUrl();
                url.setName(serviceName);
                url.setUrl("/" + serviceName + "/v3/api-docs");
                urls.add(url);
            });

        swaggerUiConfigProperties.setUrls(urls);
    }
}
```

> "Let me explain this line by line."

> "@PostConstruct means this init() method runs automatically when the application starts — after all beans are created."

> "routeDefinitionLocator.getRouteDefinitions() — this reads all the routes defined in application.yml. It returns them as a reactive stream."

> "The .subscribe() processes each route definition. For each route it checks if the routeId ends with _PREFIX. Routes ending with _PREFIX are the service proxy routes — not internal gateway routes."

> "It extracts the service name by removing _PREFIX. Then creates a SwaggerUrl object with the service name and the URL path to that service's API docs — which is routed through the gateway itself."

> "The result is — when you open the gateway's Swagger UI page, you see a dropdown with all services — item-service, inventory-service, notification-service, audit-service. You can switch between them and see all their APIs in one place. This is very useful for developers."

---

# PART 5 — Business Services — 8 Minutes

---

> "Now let me explain the 4 business services. They all follow the same pattern so I will explain item-service in detail and then mention what is different in the others."

---

### Item Service

> "Item-service manages the product catalog. It runs on port 8081 with its own MySQL database item_db."

> "The package is **com.ecommerce.itemservice**. The main class is **ItemServiceApplication.java**:"

```java
@SpringBootApplication
@EnableDiscoveryClient
public class ItemServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ItemServiceApplication.class, args);
    }
}
```

> "@EnableDiscoveryClient registers this service with Eureka on startup."

> "The layered architecture inside item-service:"

> "**Model — Item.java** — represents the items table in MySQL. Fields are id, name, description, category, created_at. @Entity maps it to database. @GeneratedValue auto generates id. @PrePersist sets createdAt automatically."

> "**DTO — ItemDTO.java** — what goes in and out of the API. Has validation annotations — @NotBlank on name and category, @Size(max=150) on name."

> "**Repository — ItemRepository.java** — extends JpaRepository. Gets findById, findAll, save, deleteById for free. Custom methods like findByCategory auto generate SQL."

> "**Service — ItemServiceImpl.java** — business logic. Creates item, fetches by id throwing ItemNotFoundException if not found, updates, deletes."

> "**Controller — ItemController.java** — REST endpoints. POST /api/items creates, GET /api/items gets all, GET /api/items/{id} gets one, PUT updates, DELETE removes."

> "All endpoints return wrapped in ApiResponse with success, message, and data fields."

> "The other three services — inventory-service, audit-service — follow the exact same pattern. Inventory has extra endpoint GET /api/inventory/low-stock?threshold=10 to find items with quantity below a threshold. Audit service has extra query endpoints to filter logs by service name, operation type, and record id."

---

# PART 6 — Complete Security Flow With Keycloak — 8 Minutes

---

> "Now let me walk through the complete security flow end to end. This is how everything works together."

---

### Step by Step Flow

> "**Step 1 — Client requests a token.**"
> "The client calls GET http://gatewayauthorizer-host/tokens/sre/v1.0. This hits GatewayController.getSREToken(). TokenService calls Keycloak with client credentials. Keycloak validates and returns an access token. The token is returned to the client."

> "**Step 2 — Client sends request through Gateway.**"
> "Client sends GET http://gatewayrouting-host:8080/api/items with header Authorization: Bearer keycloak-access-token."

> "**Step 3 — Gateway receives and routes.**"
> "The gatewayrouting service receives the request. It matches the URL /api/items against its routing rules. Matches item-service route. Looks up item-service address from Eureka discovery service. Forwards the complete request including the Authorization header to item-service."

> "**Step 4 — Item service processes.**"
> "Item service receives the request. The JWT token in the header (issued by Keycloak) is validated. Request goes through Controller → Service → Repository → MySQL. Response travels back through Gateway to Client."

---

### Why This Architecture is Better

> "This architecture is better than manual JWT for three reasons."

> "**First — Centralized security.** Keycloak is one dedicated server handling all authentication. No security logic scattered across services."

> "**Second — Role based access.** Different scopes for different roles — SRE scope, DevOps engineer scope. Each token carries different permissions. In production you would restrict which APIs each role can access."

> "**Third — Industry standard.** Keycloak uses OAuth2 and OpenID Connect — these are international security standards. Any frontend application, mobile app, or third party system can integrate easily."

---

# PART 7 — Unit Testing with Mockito — 8 Minutes

---

> "Now let me explain the **testing** in my project. I wrote comprehensive unit tests for the service layer using **JUnit 5** and **Mockito**."

> "Looking at my ItemServiceTest.java, let me walk through every part."

---

### Test Class Setup

```java
@ExtendWith(MockitoExtension.class)
class ItemServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private ItemServiceImpl itemService;

    private Item sampleItem;
    private ItemDTO sampleDTO;
```

> "**@ExtendWith(MockitoExtension.class)** — this tells JUnit to use Mockito as the extension. It enables all Mockito annotations to work automatically."

> "**@Mock private ItemRepository itemRepository** — this creates a FAKE version of ItemRepository. It is not a real repository. It does not connect to any database. It is a Mockito mock object that we can control completely."

> "**@InjectMocks private ItemServiceImpl itemService** — this creates the REAL ItemServiceImpl and automatically injects the mock repository into it through the constructor. So itemService is real code but its dependency — itemRepository — is fake."

> "This is perfect for unit testing. I test only the service logic. No database. No Spring context. Tests run in milliseconds."

---

### @BeforeEach Setup

```java
@BeforeEach
void setUp() {
    sampleItem = Item.builder()
            .id(1L)
            .name("Wireless Mouse")
            .description("Ergonomic wireless mouse")
            .category("Electronics")
            .createdAt(LocalDateTime.now())
            .build();

    sampleDTO = ItemDTO.builder()
            .name("Wireless Mouse")
            .description("Ergonomic wireless mouse")
            .category("Electronics")
            .build();
}
```

> "@BeforeEach means this setUp() method runs before EVERY test method. It creates fresh sample data for each test. sampleItem is a fake Item entity like what would come from the database. sampleDTO is a fake ItemDTO like what would come from the API request."

---

### Test 1 — Create Item

```java
@Test
void createItem_ShouldReturnCreatedItem() {
    when(itemRepository.save(any(Item.class))).thenReturn(sampleItem);

    ItemDTO result = itemService.createItem(sampleDTO);

    assertThat(result.getName()).isEqualTo("Wireless Mouse");
    assertThat(result.getCategory()).isEqualTo("Electronics");
    verify(itemRepository, times(1)).save(any(Item.class));
}
```

> "**when(itemRepository.save(any(Item.class))).thenReturn(sampleItem)** — this is called stubbing. I tell Mockito — when someone calls repository.save() with any Item object, pretend it returns sampleItem. This is how I control the fake repository."

> "**itemService.createItem(sampleDTO)** — I call the real service method with the sample DTO."

> "**assertThat(result.getName()).isEqualTo('Wireless Mouse')** — I verify the returned DTO has the correct name."

> "**verify(itemRepository, times(1)).save(any(Item.class))** — I verify that repository.save() was called exactly 1 time. This confirms the service actually tried to save the item."

---

### Test 2 — Get Item By ID When Exists

```java
@Test
void getItemById_WhenExists_ShouldReturnItem() {
    when(itemRepository.findById(1L)).thenReturn(Optional.of(sampleItem));

    ItemDTO result = itemService.getItemById(1L);

    assertThat(result.getId()).isEqualTo(1L);
    assertThat(result.getName()).isEqualTo("Wireless Mouse");
}
```

> "I stub findById(1L) to return Optional.of(sampleItem) — meaning the item was found. I call getItemById and assert the result has correct id and name."

---

### Test 3 — Get Item By ID When NOT Exists

```java
@Test
void getItemById_WhenNotExists_ShouldThrowException() {
    when(itemRepository.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> itemService.getItemById(99L))
            .isInstanceOf(ItemNotFoundException.class)
            .hasMessageContaining("99");
}
```

> "This tests the error scenario. I stub findById(99L) to return Optional.empty() — item not found. I use assertThatThrownBy to verify that calling getItemById(99L) throws ItemNotFoundException and the message contains 99."

> "This is very important — testing not just the happy path but also error scenarios. This proves my exception handling works correctly."

---

### Test 4 — Get All Items

```java
@Test
void getAllItems_ShouldReturnList() {
    when(itemRepository.findAll()).thenReturn(List.of(sampleItem));

    List<ItemDTO> result = itemService.getAllItems();

    assertThat(result).hasSize(1);
}
```

> "I stub findAll() to return a list with one item. I verify the result list has size 1."

---

### Test 5 — Delete Item When Exists

```java
@Test
void deleteItem_WhenExists_ShouldDelete() {
    when(itemRepository.existsById(1L)).thenReturn(true);

    itemService.deleteItem(1L);

    verify(itemRepository, times(1)).deleteById(1L);
}
```

> "I stub existsById to return true. Call deleteItem. Verify deleteById was called exactly once."

---

### Test 6 — Delete Item When NOT Exists

```java
@Test
void deleteItem_WhenNotExists_ShouldThrow() {
    when(itemRepository.existsById(99L)).thenReturn(false);

    assertThatThrownBy(() -> itemService.deleteItem(99L))
            .isInstanceOf(ItemNotFoundException.class);
}
```

> "Stub existsById to return false. Verify ItemNotFoundException is thrown."

---

### Why These Tests Matter

> "These 6 tests cover all critical paths in the service — create, read by id found, read by id not found, read all, delete found, delete not found. The tests run without any database, without any Spring context, without any network. They run in under 1 second. This gives me confidence that every piece of business logic works correctly."

---

# PART 8 — Complete Architecture Picture — 3 Minutes

---

> "Let me now give you the complete picture of how everything connects."

```
CLIENT (Postman / Frontend)
        |
        | Step 1: GET /tokens/sre/v1.0
        ↓
GATEWAY AUTHORIZER (Keycloak integration)
        | calls Keycloak server
        | gets OAuth2 token
        | returns token to client
        |
        | Step 2: Client now sends request with token
        ↓
GATEWAY ROUTING (Port 8080) ←→ DISCOVERY SERVICE (Port 8761)
        | matches URL pattern              |
        | asks Eureka for service address  |
        | forwards request with token      |
        ↓
BUSINESS SERVICES
  item-service        (Port 8081) ← MySQL item_db
  inventory-service   (Port 8082) ← MySQL inventory_db
  audit-service       (Port 8084) ← MySQL audit_db
        |
        | Response travels back
        ↓
GATEWAY ROUTING returns response to CLIENT
```

---

# PART 9 — What Makes This Project Strong — 3 Minutes

---

> "Let me tell you what makes this project impressive from an enterprise perspective."

> "**First — Keycloak over manual JWT.** Using an industry standard identity server instead of building security from scratch. This is what real companies use in production."

> "**Second — Role based access with scopes.** Different clients get different tokens with different scopes. SRE engineer has different access than DevOps engineer. This is proper access control."

> "**Third — Swagger Aggregation.** Instead of 4 separate Swagger pages, everything is visible in one place through the gateway. This improves developer experience significantly."

> "**Fourth — Reactive Gateway.** The gateway uses Spring WebFlux — reactive non-blocking architecture. This means the gateway can handle thousands of concurrent requests without blocking threads."

> "**Fifth — Service Discovery.** No hardcoded addresses anywhere. All service location is dynamic through Eureka. If a service moves to a different machine, nothing breaks."

> "**Sixth — Comprehensive Testing.** 6 unit tests covering all service methods including error scenarios. No database needed for tests. Professional quality testing."

---

# CLOSING — 2 Minutes

---

> "To summarize my complete project:"

> "I built an **EcommerceMicroservices** system with 6 Spring Boot applications working together. **Discoveryservice** provides Eureka service registry. **Gatewayauthorizer** integrates with Keycloak to generate role-based tokens. **Gatewayrouting** is the API gateway with Swagger aggregation routing all traffic to the correct service. **Item-service, inventory-service, and audit-service** are the business microservices each with their own MySQL database."

> "The security uses **Keycloak OAuth2** — industry standard identity management. The gateway uses **Spring WebFlux** reactive programming. Service discovery uses **Netflix Eureka**. Business services use **Spring MVC with JPA and Hibernate**. All business logic is covered by **JUnit 5 and Mockito unit tests**."

> "I am confident I can explain and defend every file, every annotation, and every design decision in this project. I am happy to go deeper into any specific area or answer any questions."

---

# One Hour Timeline

```
Opening and project overview                →  2 minutes
Why microservices                           →  4 minutes
Discovery Service — Eureka — full detail    →  6 minutes
Gateway Authorizer — Keycloak — full detail → 12 minutes
Gateway Routing — full detail               → 10 minutes
Business Services — item inventory audit   →  8 minutes
Complete security flow end to end          →  8 minutes
Unit testing with Mockito — full detail    →  8 minutes
Complete architecture picture              →  3 minutes
What makes this project strong             →  3 minutes
Closing summary                            →  2 minutes
──────────────────────────────────────────────────────
TOTAL                                      → 66 minutes
```

---

# Key Things to Remember About YOUR Project

```
Your project name    → EcommerceMicroservices
Your package names   → com.cognizant.gateway (authorizer)
                       com.cognizant.gatewayrouting
                       com.ecommerce.itemservice
Your Eureka service  → discoveryservice (not eureka-server)
Your security        → Keycloak OAuth2 with scopes
Your token roles     → SRE, DevOps Engineer
Your gateway         → WebFlux reactive (ServerHttpSecurity)
Your swagger         → Aggregated through gateway
Your tests           → 6 Mockito unit tests in ItemServiceTest
```

Practice this script out loud every day until it feels completely natural.
