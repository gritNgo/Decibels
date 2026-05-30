# Stage 1: Base Runtime Environment
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Stage 2: Build and Restore Layer
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy project files individually to leverage Docker caching layers
COPY ["Decibels.API/Decibels.API.csproj", "Decibels.API/"]
COPY ["Decibels.DataAccess/Decibels.DataAccess.csproj", "Decibels.DataAccess/"]
COPY ["Decibels.Models/Decibels.Models.csproj", "Decibels.Models/"]
COPY ["Decibels.Utility/Decibels.Utility.csproj", "Decibels.Utility/"]

# Restore Nuget dependencies
RUN dotnet restore "./Decibels.API/Decibels.API.csproj"

# Copy full source and build
COPY . .
WORKDIR "/src/Decibels.API"
RUN dotnet build "./Decibels.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Stage 3: Publish Compilation
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Decibels.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Stage 4: Final Lean Execution Image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Decibels.API.dll"]