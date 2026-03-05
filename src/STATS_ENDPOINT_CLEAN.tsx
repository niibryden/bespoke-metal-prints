// ========== LIGHTWEIGHT STATS ENDPOINT - NO HEAVY DEPENDENCIES ==========
app.get("/make-server-3e3a9cd7/admin/stats", async (c) => {
  try {
    console.log('📊 ===== ADMIN STATS ENDPOINT (ONE-BY-ONE) =====');
    
    const period = c.req.query("period") || "all";
    
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );
    
    // Date cutoff: December 1, 2025
    const dateCutoff = new Date('2025-12-01T00:00:00Z');
    console.log(`📅 [STATS] Filtering orders from ${dateCutoff.toISOString()} onwards`);
    
    // Calculate date range for stats period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }
    
    console.log(`[STATS] Period: ${period}, Start date: ${startDate.toISOString()}`);
    
    // Step 1: Fetch order keys
    const { data: keyData, error: keyError } = await supabase
      .from("kv_store_3e3a9cd7")
      .select("key")
      .like("key", "order:%")
      .order("key", { ascending: false })
      .limit(100);
    
    if (keyError) {
      return c.json({ totalOrders: 0, revenue: 0, ordersByStatus: {}, error: keyError.message }, 500);
    }
    
    if (!keyData || keyData.length === 0) {
      return c.json({
        totalOrders: 0,
        revenue: 0,
        ordersByStatus: {},
        averageOrderValue: 0,
        totalCustomers: 0,
        stockPhotos: 0,
        lowStockItems: 0,
        period,
        cached: false
      });
    }
    
    console.log(`✅ [STATS] Found ${keyData.length} order keys`);
    
    // Step 2: Fetch orders ONE AT A TIME with timeout
    const orderKeys = keyData.map((row: any) => row.key);
    const maxOrdersToTry = 50;
    const targetOrders = 20;
    let allOrders: any[] = [];
    let consecutiveErrors = 0;
    let totalErrors = 0;
    const maxConsecutiveErrors = 5;
    
    for (let i = 0; i < maxOrdersToTry && allOrders.length < targetOrders; i++) {
      if (i >= orderKeys.length) break;
      
      const orderKey = orderKeys[i];
      const orderNum = i + 1;
      
      try {
        const orderPromise = supabase
          .from("kv_store_3e3a9cd7")
          .select("value")
          .eq("key", orderKey)
          .single();
        
        const timeoutPromise = new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error("Order timeout after 3s")), 3000)
        );
        
        const { data: orderData, error: orderError } = await Promise.race([
          orderPromise,
          timeoutPromise
        ]) as any;
        
        if (orderError) {
          console.warn(`⚠️ [STATS] Order ${orderNum} error`);
          consecutiveErrors++;
          totalErrors++;
          
          if (consecutiveErrors >= maxConsecutiveErrors) {
            console.error(`❌ [STATS] Too many consecutive errors, stopping`);
            break;
          }
          
          continue;
        }
        
        if (orderData?.value) {
          const order = orderData.value;
          
          if (order.createdAt) {
            const orderDate = new Date(order.createdAt);
            if (orderDate >= dateCutoff) {
              allOrders.push(order);
              console.log(`✅ [STATS] Order ${orderNum}: Added (total: ${allOrders.length})`);
              consecutiveErrors = 0;
            }
          }
        }
        
        if (i < maxOrdersToTry - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error: any) {
        console.error(`❌ [STATS] Order ${orderNum} exception: ${error.message}`);
        consecutiveErrors++;
        totalErrors++;
        
        if (consecutiveErrors >= maxConsecutiveErrors) {
          console.error(`❌ [STATS] Too many consecutive errors, stopping`);
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`📋 [STATS] Successfully fetched ${allOrders.length} recent orders (errors: ${totalErrors})`);
    
    // Filter by period date range
    const filteredOrders = allOrders.filter((order: any) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate;
    });
    
    // Calculate stats
    const ordersByStatus: any = {
      pending: 0,
      processing: 0,
      paid: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    
    let revenue = 0;
    
    filteredOrders.forEach((order: any) => {
      const status = order.status || 'pending';
      ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
      
      if (['paid', 'shipped', 'delivered', 'processing'].includes(status) || 
          order.paymentStatus === 'succeeded') {
        revenue += order.amount || 0;
      }
    });
    
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;
    
    // Get unique customers
    const uniqueCustomers = new Set(
      filteredOrders.map((o: any) => o.customerEmail).filter(Boolean)
    );
    
    console.log(`[OK] Stats calculated: ${totalOrders} orders, $${(revenue/100).toFixed(2)} revenue`);
    
    return c.json({
      totalOrders,
      revenue,
      ordersByStatus,
      averageOrderValue,
      totalCustomers: uniqueCustomers.size,
      stockPhotos: 0,
      lowStockItems: 0,
      period,
      cached: false
    });
    
  } catch (error) {
    console.error('[ERROR] Exception in stats endpoint:', error);
    return c.json({
      totalOrders: 0,
      revenue: 0,
      ordersByStatus: {},
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// ========== END LIGHTWEIGHT STATS ENDPOINT ==========
