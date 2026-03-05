<?php

namespace App\Http\Controllers\Api;

use App\Classes\RestAPI;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCampaignRequest;
use App\Http\Resources\CampaignResource;
use App\Models\Campaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    /**
     * Public: Get active campaigns (e.g. for homepage hero banners).
     */
    public function index(): JsonResponse
    {
        $campaigns = Campaign::active()->latest()->get();

        return RestAPI::response(CampaignResource::collection($campaigns)->resolve());
    }

    /**
     * Admin: Get all campaigns.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $campaigns = Campaign::latest()->paginate($request->integer('per_page', 20));

        return RestAPI::setPagination($campaigns)
            ->response(CampaignResource::collection($campaigns)->resolve());
    }

    /**
     * Admin: Store a new campaign.
     */
    public function store(StoreCampaignRequest $request): JsonResponse
    {
        $campaign = Campaign::create($request->validated());

        return RestAPI::response(new CampaignResource($campaign), true, 'Campaign created successfully');
    }

    /**
     * Admin: Show a single campaign.
     */
    public function show(Campaign $campaign): JsonResponse
    {
        return RestAPI::response(new CampaignResource($campaign));
    }

    /**
     * Admin: Update campaign.
     */
    public function update(Request $request, Campaign $campaign): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'banner_image' => ['nullable', 'string', 'url', 'max:500'],
            'discount_type' => ['sometimes', 'in:percentage,fixed'],
            'discount_value' => ['sometimes', 'numeric', 'min:0'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after:start_date'],
            'is_active' => ['boolean'],
            'product_ids' => ['nullable', 'array'],
            'brand' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'tags' => ['nullable', 'array'],
        ]);

        $campaign->update($validated);

        return RestAPI::response(new CampaignResource($campaign), true, 'Campaign updated successfully');
    }

    /**
     * Admin: Delete a campaign.
     */
    public function destroy(Campaign $campaign): JsonResponse
    {
        $campaign->delete();

        return RestAPI::messageResponse('Campaign deleted successfully');
    }
}
